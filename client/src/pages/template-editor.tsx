import { TemplateForm } from "@/components/template/template-form";

interface TemplateEditorProps {
  id?: string;
}

export default function TemplateEditor({ id }: TemplateEditorProps) {
  const isEditing = !!id;

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-lg font-semibold text-gray-900">
            {isEditing ? "Edit Template" : "New Template"}
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <TemplateForm id={id} />
      </div>
    </div>
  );
}
