'use client';

import { useState } from 'react';
import { OutsideTabPanel, OutsideTabs } from '@/components/ui/outside-tabs';
import { HeaderIcon, HeaderText } from '@/components/ui/text';
import { Newspaper } from 'lucide-react';
import { z, ZodType } from 'zod';
import { useDynamicFormSchema } from '@/lib/db/use-moa-backend';

/**
 * The form builder.
 * Changes based on field inputs.
 *
 * @component
 */
const DynamicForm = ({ form }: { form: string }) => {
  const dynamicForm = useDynamicFormSchema(form);
  console.log(dynamicForm.error);

  return <></>;
};

/**
 * The forms page component
 *
 * @component
 */
type TabKey = 'Form Generator' | 'My Forms';
export default function FormsPage() {
  const [tab, setTab] = useState<TabKey>('Form Generator');

  const origZodSchema = z
    .string()
    .refine((s) => s.split(' ').every((word) => /^[A-Z][a-z]*$/.test(word)), {
      message: 'Value must be in title case',
    });

  console.log('orig', origZodSchema.safeParse('Hello World Tur'));

  return (
    <div className="container max-w-6xl px-4 sm:px-10 pt-6 sm:pt-16 mx-auto">
      <div className="mb-6 sm:mb-8 animate-fade-in space-y-5">
        {/* Header */}
        <DynamicForm form="student-moa" />
        <div>
          <div className="flex flex-row items-center gap-3 mb-2">
            <HeaderIcon icon={Newspaper} />
            <HeaderText>Forms</HeaderText>
          </div>
          <div className="flex-1 flex-row">
            <p className="text-gray-600 text-sm sm:text-base mb-2">
              Automatically generate the internship forms you need using your
              saved details.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <OutsideTabs
          value={tab}
          onChange={(v) => setTab(v as TabKey)}
          tabs={[
            { key: 'Form Generator', label: 'Form Generator' },
            { key: 'My Forms', label: 'My Forms' },
          ]}
        >
          {/* Form Generator */}
          <OutsideTabPanel when="Form Generator" activeKey={tab}>
            <div>Panel 1</div>
          </OutsideTabPanel>

          {/* Past Forms */}
          <OutsideTabPanel when="My Forms" activeKey={tab}>
            <div>Panel 2</div>
          </OutsideTabPanel>
        </OutsideTabs>
      </div>
    </div>
  );
}
