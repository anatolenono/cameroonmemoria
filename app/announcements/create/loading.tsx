import { 
  PageHeaderSkeleton, 
  FormSkeleton 
} from "@/components/ui/loading-skeletons";

export default function CreateAnnouncementLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeaderSkeleton />
      <FormSkeleton />
    </div>
  );
} 