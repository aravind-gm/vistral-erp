import { Toaster as SonnerToaster } from "sonner";

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <SonnerToaster
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast rounded-xl border border-[#E5E7EB] bg-white text-[#111827] shadow-md",
          description: "text-[#6B7280]",
          actionButton:
            "bg-[#111827] text-white",
          cancelButton:
            "bg-[#F3F4F6] text-[#374151]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
