import Link from "next/link";

const features = [
    {
        title: "Discover workshops",
        description:
            "Search and filter art workshops by type, and find ones near you using your browser location.",
    },
    {
        title: "Save your favourites",
        description: "Bookmark workshops you like and revisit them anytime from your profile.",
    },
    {
        title: "Create workshops",
        description:
            "Professors can publish workshops with a map location, date, type, description, and a link.",
    },
    {
        title: "Manage institutes",
        description: "Professors can create and edit their institute and link it to their workshops.",
    },
];

export default function Home() {
    return (
        <div className="flex min-h-0 w-full flex-1 flex-col items-center overflow-y-auto bg-zinc-50 px-8 py-16 dark:bg-black">
            <div className="flex w-full max-w-5xl flex-1 flex-col justify-center gap-16">
                <section className="flex flex-col items-center text-center">
                    <h1 className="text-5xl font-semibold tracking-tight text-black sm:text-6xl dark:text-zinc-50">
                        Art Shop
                    </h1>
                    <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                        Discover and create art workshops around you. Browse by type or distance, save
                        your favourites, and share your own workshops with the community.
                    </p>
                    <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                        <Link
                            href="/workshops"
                            className="rounded-md bg-yellow-500 px-8 py-3 text-sm font-medium text-white hover:bg-yellow-600"
                        >
                            Browse workshops
                        </Link>
                        <Link
                            href="/register"
                            className="rounded-md border border-zinc-300 px-8 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                            Create an account
                        </Link>
                    </div>
                </section>

                <section className="grid w-full gap-6 sm:grid-cols-2">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="flex flex-col rounded-xl bg-white p-8 shadow dark:bg-zinc-900"
                        >
                            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
                                {feature.title}
                            </h2>
                            <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
}
