-- Migration: 20261019000002_rls_and_triggers.sql
-- Description: Sets up Row Level Security (RLS) policies and automatic user profile + workspace provisioning trigger.

-- 1. Enable Row Level Security on all application tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_memberships ENABLE ROW LEVEL SECURITY;

-- 2. Profiles RLS Policies
-- Users can only view and update their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 3. Workspaces RLS Policies
-- Customers can only access workspaces they belong to
CREATE POLICY "Members can view their workspaces"
    ON public.workspaces
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_memberships
            WHERE workspace_memberships.workspace_id = workspaces.id
            AND workspace_memberships.user_id = auth.uid()
        )
    );

CREATE POLICY "Owners and admins can update their workspace"
    ON public.workspaces
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_memberships
            WHERE workspace_memberships.workspace_id = workspaces.id
            AND workspace_memberships.user_id = auth.uid()
            AND workspace_memberships.role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workspace_memberships
            WHERE workspace_memberships.workspace_id = workspaces.id
            AND workspace_memberships.user_id = auth.uid()
            AND workspace_memberships.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Authenticated users can create workspaces"
    ON public.workspaces
    FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their workspace"
    ON public.workspaces
    FOR DELETE
    USING (auth.uid() = owner_id);

-- 4. Workspace Memberships RLS Policies
CREATE POLICY "Members can view co-members in same workspace"
    ON public.workspace_memberships
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_memberships AS my_membership
            WHERE my_membership.workspace_id = workspace_memberships.workspace_id
            AND my_membership.user_id = auth.uid()
        )
    );

CREATE POLICY "Owners and admins can manage memberships"
    ON public.workspace_memberships
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_memberships AS my_membership
            WHERE my_membership.workspace_id = workspace_memberships.workspace_id
            AND my_membership.user_id = auth.uid()
            AND my_membership.role IN ('owner', 'admin')
        )
    );

-- 5. Automatic Profile & Workspace Provisioning on Sign-Up
-- Triggers whenever a new user registers in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_workspace_id UUID;
    user_full_name TEXT;
    user_business_name TEXT;
    user_lang TEXT;
BEGIN
    -- Extract metadata supplied during registration
    user_full_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
    user_business_name := new.raw_user_meta_data->>'business_name';
    user_lang := COALESCE(new.raw_user_meta_data->>'preferred_language', 'bn');

    -- 1. Create Profile (Idempotent: ON CONFLICT DO NOTHING)
    INSERT INTO public.profiles (id, full_name, business_name, preferred_language, onboarding_completed)
    VALUES (
        new.id,
        user_full_name,
        user_business_name,
        user_lang,
        FALSE
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        updated_at = timezone('utc'::text, now());

    -- 2. Create Initial Personal Workspace (if none exists yet)
    IF NOT EXISTS (SELECT 1 FROM public.workspaces WHERE owner_id = new.id) THEN
        INSERT INTO public.workspaces (name, owner_id)
        VALUES (
            COALESCE(user_business_name, user_full_name || '''s Shop'),
            new.id
        )
        RETURNING id INTO new_workspace_id;

        -- 3. Add User as Owner in Workspace Memberships
        INSERT INTO public.workspace_memberships (workspace_id, user_id, role)
        VALUES (new_workspace_id, new.id, 'owner')
        ON CONFLICT (workspace_id, user_id) DO NOTHING;
    END IF;

    RETURN new;
EXCEPTION
    WHEN OTHERS THEN
        -- Log exception and re-raise to prevent inconsistent orphaned state
        RAISE LOG 'Error in handle_new_user trigger for user %: %', new.id, SQLERRM;
        RETURN new;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 6. Helper Function for Updating Timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_workspaces_updated_at ON public.workspaces;
CREATE TRIGGER set_workspaces_updated_at
    BEFORE UPDATE ON public.workspaces
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
