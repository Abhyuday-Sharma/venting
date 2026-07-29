
import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const XLogo = () => (
    <svg 
        className="h-5 w-5 text-muted-foreground"
        fill="currentColor"
        viewBox="0 0 16 16"
        >
        <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.6.75Zm-1.7 12.95h1.949L3.545 2.14H1.48l9.42 11.56Z"/>
    </svg>
)

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <main className="flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">{children}</main>
            <footer className="hidden md:flex container mx-auto px-4 md:px-8 py-8 flex-col md:flex-row md:justify-between items-center gap-8">
                <div className="flex justify-start">
                    <Image 
                        src="/ventingmain.png"
                        alt="Venting Logo"
                        width={727}
                        height={213}
                        className="w-32 h-auto opacity-60 dark:invert"
                    />
                </div>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
                    <Button asChild variant="link">
                        <Link href="/about">About</Link>
                    </Button>
                    <Button asChild variant="link">
                        <Link href="/updates">Updates & AI Info</Link>
                    </Button>
                    <Button asChild variant="link">
                        <Link href="/feedback">Feedback</Link>
                    </Button>
                    <Button asChild variant="link">
                        <Link href="/legal/terms-of-service">Terms</Link>
                    </Button>
                    <Button asChild variant="link">
                        <Link href="/legal/notes">Legal Notes</Link>
                    </Button>
                    <Button asChild variant="link">
                        <Link href="/legal/privacy-policy">Privacy</Link>
                    </Button>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-center md:justify-end gap-2 md:gap-4">
                    <h3 className="text-sm font-semibold text-muted-foreground">Follow Us</h3>
                    <div className="flex gap-2">
                        <Button asChild variant="ghost" size="icon">
                            <a href="https://x.com/ventingsupport?s=21" target="_blank" rel="noopener noreferrer">
                                <XLogo />
                                <span className="sr-only">X (formerly Twitter)</span>
                            </a>
                        </Button>
                         <Button asChild variant="ghost" size="icon">
                            <a href="https://www.instagram.com/venting.in?igsh=MWh2ZDljOGFzem96Ng%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer">
                                <Instagram className="h-5 w-5 text-muted-foreground" />
                                <span className="sr-only">Instagram</span>
                            </a>
                        </Button>
                    </div>
                </div>
            </footer>
        </>
    );
}
