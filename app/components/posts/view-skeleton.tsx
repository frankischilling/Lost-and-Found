import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export function ViewPostSkeleton() {
    return (
        <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-8 w-2/3 md:h-9" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>

            {/* Main Card */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-4 w-40" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Image */}
                        <div className="w-full md:w-2/3">
                            <Skeleton className="w-full h-80 md:h-[420px] rounded-md" />
                            <div className="flex justify-between mt-2">
                                <Skeleton className="h-10 w-10" />
                                <Skeleton className="h-6 w-20" />
                                <Skeleton className="h-10 w-10" />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="w-full md:w-1/3 flex flex-col gap-4">
                            {/* Details Card */}
                            <div className="border rounded-lg p-4 space-y-3">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-28" />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-20 w-full" />
                            </div>

                            {/* Tags */}
                            <div className="flex gap-2 flex-wrap">
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-6 w-28" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Comments Section */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>
                        <Skeleton className="h-6 w-32" />
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="space-y-2 pb-4 border-b last:border-b-0">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* History Section */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        <Skeleton className="h-6 w-32" />
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-start gap-2">
                            <Skeleton className="h-4 w-4 mt-0.5 rounded-full" />
                            <div className="flex-1 space-y-1">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
