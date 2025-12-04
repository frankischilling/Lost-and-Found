import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export function PostCardSkeleton() {
    return (
        <Card className="overflow-hidden flex flex-col h-full">
            <CardHeader className="pb-0">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-2 pt-4">
                <div className="relative rounded-md overflow-hidden border bg-muted h-64 flex items-center justify-center">
                    <Skeleton className="w-full h-full" />
                </div>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-4 w-32 mt-auto" />
            </CardContent>
        </Card>
    );
}

export function PostGridSkeleton({ count = 3 }: { count?: number }) {
    // Ensure we show at least 1 and no more than 9 skeletons
    const skeletonCount = Math.max(1, Math.min(count, 9));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {Array.from({ length: skeletonCount }).map((_, i) => (
                <PostCardSkeleton key={i} />
            ))}
        </div>
    );
}
