import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { ValueStrip } from '../components/home/ValueStrip';
import { FeaturesOverview } from '../components/home/FeaturesOverview';
import { HowItWorksSteps } from '../components/home/HowItWorksSteps';
import { PricingOverview } from '../components/home/PricingOverview';
import { FAQAccordion } from '../components/home/FAQAccordion';
import { CTASection } from '../components/home/CTASection';

export const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <ValueStrip />
      <FeaturesOverview />
      <HowItWorksSteps />
      <PricingOverview />
      <FAQAccordion limit={6} />
      <CTASection />
    </div>
  );
};
