import { useState } from "react";
import { getCourseImage, getCourseImageDetails, DEFAULT_COURSE_IMAGE } from "@/data/course-images";
import { cn } from "@/lib/utils";

interface CourseStickerProps {
  courseSlug?: string;
  courseId?: string;
  title?: string;
  className?: string;
  aspectRatio?: "16/9" | "auto";
  priority?: boolean;
}

export function CourseSticker({
  courseSlug,
  courseId,
  title,
  className,
  aspectRatio = "16/9",
  priority = false,
}: CourseStickerProps) {
  const [imgError, setImgError] = useState(false);
  const identifier = courseSlug || courseId || "";
  const details = getCourseImageDetails(identifier);
  const imageSrc = imgError ? DEFAULT_COURSE_IMAGE : getCourseImage(identifier);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-[#050B14] select-none",
        aspectRatio === "16/9" && "aspect-video",
        className,
      )}
    >
      <img
        src={imageSrc}
        alt={details.altText || `${title || details.title} course banner`}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onError={() => setImgError(true)}
        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
      />
    </div>
  );
}
