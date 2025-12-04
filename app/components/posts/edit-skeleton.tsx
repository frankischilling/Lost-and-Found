import { Skeleton } from "~/components/ui/skeleton";

export function EditPostSkeleton() {
    return (
        <main className="pt-16 p-4 container mx-auto">
            <div className="m-auto w-full lg:w-2/5">
                <Skeleton className="h-8 w-48 mx-auto mb-4" />
                <Skeleton className="h-4 w-full mx-auto mb-6" />

                <div className="space-y-6">
                    {/* Title Field */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    {/* Item Name Field */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    {/* Post Type Select */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    {/* Description Textarea */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-24 w-full" />
                    </div>

                    {/* Content Textarea */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-32 w-full" />
                    </div>

                    {/* Location Field */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    {/* Date Field */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    {/* Tags Field */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-24 w-full" />
                    </div>

                    {/* Privacy Select */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 justify-center pt-4">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>
            </div>
        </main>
    );
}
