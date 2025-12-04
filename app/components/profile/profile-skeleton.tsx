import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export function ProfileSkeleton() {
    return (
        <main className="pt-16 p-4 container mx-auto max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-10 w-24" />
            </div>

            {/* Profile Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-20 h-20 rounded-full" />
                        <div className="flex-1">
                            <Skeleton className="h-7 w-48 mb-2" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Skeleton className="h-4 w-12 mb-2" />
                            <Skeleton className="h-5 w-40" />
                        </div>
                        <div>
                            <Skeleton className="h-4 w-12 mb-2" />
                            <Skeleton className="h-5 w-32" />
                        </div>
                        <div>
                            <Skeleton className="h-4 w-12 mb-2" />
                            <Skeleton className="h-5 w-24" />
                        </div>
                        <div>
                            <Skeleton className="h-4 w-20 mb-2" />
                            <Skeleton className="h-5 w-36" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Post History Section */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>
                        <Skeleton className="h-6 w-32" />
                    </CardTitle>
                    <CardDescription>
                        <Skeleton className="h-4 w-48 mt-2" />
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="border rounded-lg overflow-hidden">
                                <Skeleton className="w-full h-64" />
                                <div className="p-4 space-y-2">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
