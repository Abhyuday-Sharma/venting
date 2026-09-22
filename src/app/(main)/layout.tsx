import { PublicFooter } from "@/components/layout/public-footer";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <main className="flex-1">{children}</main>
            <PublicFooter />
        </>
    );
}
