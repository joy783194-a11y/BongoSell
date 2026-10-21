import React, { useState, useEffect, useCallback } from 'react';
import {
  Bot,
  ShieldCheck,
  Sliders,
  CheckCircle2,
  MessageSquare,
  Truck,
  Save,
  BookOpen,
  Plus,
  Trash2,
  AlertCircle,
  FileText,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../../components/common/Card';
import {
  getAIAgentSettings,
  saveAIAgentSettings,
  getKnowledgeDocuments,
  addKnowledgeDocument,
  deleteKnowledgeDocument,
} from '../../lib/database-service';
import {
  DatabaseAIAgentSettings,
  DatabaseKnowledgeDocument,
} from '../../lib/supabase';

export const DashboardAgentPage: React.FC = () => {
  const { currentWorkspace } = useAuth();
  const { isBangla } = useLanguage();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Agent Settings State
  const [agentName, setAgentName] = useState('BongoSell AI');
  const [isEnabled, setIsEnabled] = useState(true);
  const [prefLang, setPrefLang] = useState<'bn' | 'banglish' | 'en'>('bn');
  const [tone, setTone] = useState<'polite_bn' | 'banglish' | 'formal'>('polite_bn');
  const [greeting, setGreeting] = useState('আসসালামু আলাইকুম! আপনাকে কীভাবে সাহায্য করতে পারি?');
  const [instructions, setInstructions] = useState('');
  const [minPriceEnforce, setMinPriceEnforce] = useState(true);
  const [humanHandover, setHumanHandover] = useState(true);

  // Knowledge Documents State
  const [knowledgeDocs, setKnowledgeDocs] = useState<DatabaseKnowledgeDocument[]>([]);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [docType, setDocType] = useState<DatabaseKnowledgeDocument['document_type']>('faq');
  const [isAddingDoc, setIsAddingDoc] = useState(false);

  const workspaceId = currentWorkspace?.id || 'default-ws';

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [settings, docs] = await Promise.all([
      getAIAgentSettings(workspaceId),
      getKnowledgeDocuments(workspaceId),
    ]);

    if (settings) {
      setAgentName(settings.agent_name || 'BongoSell AI');
      setIsEnabled(Boolean(settings.enabled));
      setPrefLang(settings.preferred_language || 'bn');
      setTone(settings.tone || 'polite_bn');
      setGreeting(settings.greeting_message || 'আসসালামু আলাইকুম! আপনাকে কীভাবে সাহায্য করতে পারি?');
      setInstructions(settings.business_instructions || '');
      setMinPriceEnforce(settings.minimum_price_enforcement_enabled !== false);
      setHumanHandover(settings.human_handover_enabled !== false);
    }
    setKnowledgeDocs(docs);
    setIsLoading(false);
  }, [workspaceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const { error } = await saveAIAgentSettings(workspaceId, {
      agent_name: agentName.trim(),
      enabled: isEnabled,
      preferred_language: prefLang,
      tone,
      greeting_message: greeting.trim(),
      business_instructions: instructions.trim() || null,
      minimum_price_enforcement_enabled: minPriceEnforce,
      human_handover_enabled: humanHandover,
    });

    setIsSaving(false);

    if (error) {
      alert(error);
    } else {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim()) {
      alert(isBangla ? 'শিরোনাম ও কন্টেন্ট পূরণ করুন।' : 'Please fill title and content.');
      return;
    }

    setIsAddingDoc(true);
    const { error } = await addKnowledgeDocument(workspaceId, {
      title: docTitle.trim(),
      content: docContent.trim(),
      document_type: docType,
      status: 'active',
    });
    setIsAddingDoc(false);

    if (error) {
      alert(error);
    } else {
      setShowAddDocModal(false);
      setDocTitle('');
      setDocContent('');
      setDocType('faq');
      const docs = await getKnowledgeDocuments(workspaceId);
      setKnowledgeDocs(docs);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (
      !confirm(
        isBangla
          ? 'আপনি কি নিশ্চিতভাবে এই ডকুমেন্টটি মুছে ফেলতে চান?'
          : 'Are you sure you want to remove this knowledge document?'
      )
    ) {
      return;
    }

    const { error } = await deleteKnowledgeDocument(id);
    if (error) {
      alert(error);
    } else {
      setKnowledgeDocs((prev) => prev.filter((d) => d.id !== id));
    }
  };

  return (
    <div className="space-y-8 text-left max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {isBangla ? 'এআই সেলস এজেন্ট ও নলেজ রুলস' : 'AI Sales Agent & Knowledge Rules'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isBangla
              ? 'কথোপকথনের ভাষা, সেলার প্রাইসিং গার্ডরেল ও সাধারণ প্রশ্নোত্তর ডেটাবেজে কনফিগার করুন'
              : 'Multi-tenant database configuration for agent tone, pricing safety, and store knowledge'}
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3.5 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>{isBangla ? 'রুলস সংরক্ষিত হয়েছে!' : 'Rules Saved to DB!'}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Card 1: Agent Master Switch & Identity */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <Bot className="w-4 h-4" />
              <span>{isBangla ? '১. এজেন্টের পরিচিতি ও স্ট্যাটাস' : '1. Agent Identity & Power'}</span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <span className="text-slate-300 font-medium">
                {isEnabled ? (isBangla ? 'অটোমেশন চালু' : 'Enabled') : (isBangla ? 'পজ করা' : 'Paused')}
              </span>
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300 block">
                {isBangla ? 'এজেন্টের নাম' : 'Agent Name'}
              </label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="w-full bg-[#0E131B] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300 block">
                {isBangla ? 'প্রাথমিক কথোপকথনের ভাষা' : 'Primary Language'}
              </label>
              <select
                value={prefLang}
                onChange={(e) => setPrefLang(e.target.value as any)}
                className="w-full bg-[#0E131B] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="bn">বাংলা (Bengali)</option>
                <option value="banglish">বাংলিশ (Banglish)</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div className="space-y-1 text-xs sm:text-sm">
            <label className="font-semibold text-slate-300 block">
              {isBangla ? 'ওয়েলকাম / গ্রিটিং মেসেজ' : 'Greeting Message'}
            </label>
            <input
              type="text"
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              className="w-full bg-[#0E131B] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </Card>

        {/* Card 2: Tone of Voice */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Bot className="w-4 h-4" />
            <span>{isBangla ? '২. চ্যাট টোন ও বাচনভঙ্গি' : '2. Tone of Voice'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <button
              type="button"
              onClick={() => setTone('polite_bn')}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                tone === 'polite_bn'
                  ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span className="font-bold block mb-1">
                {isBangla ? 'বিনীত বাংলা (জনপ্রিয়)' : 'Polite Bangla (Popular)'}
              </span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                "আপু / ভাইয়া সম্বোধনে অত্যন্ত অমায়িক ও আন্তরিক বিক্রয় আলাপ।"
              </p>
            </button>

            <button
              type="button"
              onClick={() => setTone('banglish')}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                tone === 'banglish'
                  ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span className="font-bold block mb-1">
                {isBangla ? 'ক্যাজুয়াল বাংলিশ' : 'Casual Banglish'}
              </span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                "রোমান হরফে চটপটে আলাপ (যেমন: bhai stock ache, fixed price)."
              </p>
            </button>

            <button
              type="button"
              onClick={() => setTone('formal')}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                tone === 'formal'
                  ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span className="font-bold block mb-1">
                {isBangla ? 'প্রফেশনাল কর্পোরেট' : 'Professional Formal'}
              </span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                "মার্জিত ও সংক্ষিপ্ত ব্যবসায়িক যোগাযোগ।"
              </p>
            </button>
          </div>
        </Card>

        {/* Card 3: Pricing & Handover Guardrails */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>{isBangla ? '৩. সেলার প্রাইস প্রটেকশন ও টেকওভার গার্ডরেল' : '3. Pricing Protection & Takeover'}</span>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <label className="flex items-center justify-between p-3.5 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer">
              <div>
                <span className="font-semibold text-white block">
                  {isBangla ? 'ফ্লোর প্রাইস এনফোর্সমেন্ট' : 'Enforce Minimum Floor Price Floor'}
                </span>
                <span className="text-slate-400 text-xs">
                  {isBangla
                    ? 'এআই কখনোই পণ্যের নির্ধারিত সর্বনিম্ন মূল্যের নিচে দাম কমাবে না।'
                    : 'AI will never offer discounts below seller defined floor price.'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={minPriceEnforce}
                onChange={(e) => setMinPriceEnforce(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer">
              <div>
                <span className="font-semibold text-white block">
                  {isBangla ? 'হিউম্যান হ্যান্ডওভার সাপোর্ট' : 'Allow Human Handover'}
                </span>
                <span className="text-slate-400 text-xs">
                  {isBangla
                    ? 'গ্রাহক স্পেসিফিক প্রশ্ন বা অ্যাডমিন সাপোর্ট চাইলে এআই পজ হবে।'
                    : 'Auto-pause AI if user requests human or files custom complaint.'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={humanHandover}
                onChange={(e) => setHumanHandover(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
            </label>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="font-semibold text-slate-300 text-xs block">
              {isBangla ? 'কাস্টম সেলার নির্দেশিকা (Custom Prompt)' : 'Seller Business Prompt Instructions'}
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder={
                isBangla
                  ? 'যেমন: ঢাকার ভেতরে ১-২ দিনে ডেলিভারি হবে। কোনো পাইকারি দর নেই।'
                  : 'e.g. Always mention cash-on-delivery. Delivery inside Dhaka takes 2 days.'
              }
              className="w-full bg-[#0E131B] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </Card>

        {/* Submit Rules Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? (isBangla ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBangla ? 'এআই রুলস সেভ করুন' : 'Save Agent Rules')}</span>
          </button>
        </div>
      </form>

      {/* Card 4: Knowledge Documents Manager (Phase 3 Requirement) */}
      <Card className="p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {isBangla ? 'নলেজ বেস ও পলিসি ডকুমেন্টস' : 'Knowledge Base & Policy Documents'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isBangla
                  ? 'ডেলিভারি পলিসি, রিটার্ন নিয়ম এবং সাইজ গাইড যোগ করুন যা এআই সঠিক উত্তরে ব্যবহার করবে'
                  : 'Ground AI replies with structured knowledge documents in PostgreSQL database'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddDocModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>{isBangla ? 'নতুন ডকুমেন্ট' : 'Add Document'}</span>
          </button>
        </div>

        {knowledgeDocs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            {isBangla ? 'কোনো নলেজ ডকুমেন্ট যুক্ত করা হয়নি।' : 'No knowledge documents found.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {knowledgeDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-xs sm:text-sm">{doc.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-950/60 text-indigo-300 uppercase">
                      {doc.document_type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">{doc.content}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteDoc(doc.id)}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Knowledge Document Modal */}
      {showAddDocModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowAddDocModal(false)}
        >
          <div
            className="bg-[#131B26] border border-slate-700 max-w-md w-full rounded-2xl p-6 space-y-4 text-left relative my-8 shadow-2xl text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                {isBangla ? 'নতুন নলেজ ডকুমেন্ট যোগ করুন' : 'Add Knowledge Document'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddDocModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDocument} className="space-y-3.5 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">
                  {isBangla ? 'ডকুমেন্ট শিরোনাম' : 'Document Title'} *
                </label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="যেমন: সাইজ গাইড বা রিটার্ন পলিসি"
                  className="w-full bg-[#0E131B] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">
                  {isBangla ? 'ডকুমেন্ট টাইপ' : 'Document Type'}
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full bg-[#0E131B] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="shipping">{isBangla ? 'ডেলিভারি ও কুরিয়ার (Shipping)' : 'Shipping'}</option>
                  <option value="policy">{isBangla ? 'রিটার্ন ও এক্সচেঞ্জ (Policy)' : 'Policy'}</option>
                  <option value="faq">{isBangla ? 'সাধারণ প্রশ্নোত্তর (FAQ)' : 'FAQ'}</option>
                  <option value="size_guide">{isBangla ? 'সাইজ ও মাপজোখ (Size Guide)' : 'Size Guide'}</option>
                  <option value="other">{isBangla ? 'অন্যান্য (Other)' : 'Other'}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">
                  {isBangla ? 'ডকুমেন্টের বিস্তারিত বিবরণ' : 'Content'} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  placeholder={
                    isBangla
                      ? 'এআই এখান থেকে তথ্য নিয়ে গ্রাহকের প্রশ্নের সরাসরি নিখুঁত উত্তর দেবে...'
                      : 'Provide factual guidelines for the AI assistant...'
                  }
                  className="w-full bg-[#0E131B] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDocModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  {isBangla ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isAddingDoc}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isAddingDoc ? (isBangla ? 'যোগ হচ্ছে...' : 'Saving...') : (isBangla ? 'ডকুমেন্ট সংরক্ষণ করুন' : 'Save Document')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
