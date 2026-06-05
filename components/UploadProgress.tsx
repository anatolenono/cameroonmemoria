interface UploadProgressProps {
  progress: number;
  showPercentage?: boolean;
  height?: string;
  className?: string;
}

export function UploadProgress({
  progress,
  showPercentage = true,
  height = "h-2.5",
  className = ""
}: UploadProgressProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full bg-gray-200 rounded-full ${height}`}>
        <div 
          className={`bg-blue-600 ${height} rounded-full transition-all duration-300`} 
          style={{ width: `${progress}%` }}
        />
      </div>
      {showPercentage && (
        <p className="text-sm text-center mt-2">{progress}% Complété</p>
      )}
    </div>
  );
} 