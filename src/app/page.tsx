"use client";

import Image from "next/image";
import GardenImage from "@/images/home.png";
import HomeText from "@/images/NewLeafText.png";
import Button from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // redirect to edit page when user unverified
  useEffect(() => {
    if (status === "authenticated") {
      const userId = session?.user?.id;
      const isVerified = session?.user?.verified;

      if (userId && isVerified === false) {
        router.push(`/profile/${userId}/edit`);
      }
    }
  }, [session, status, router]);

  // A safe click handler that only runs in the browser
  const handleScrollToFeatures = () => {
    // `document` is available on the client, so this is safe:
    document.querySelector("#Features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-background">
      <main>
        {/* Hero section */}
        <div className="relative isolate overflow-hidden pb-16 pt-14 sm:pb-20">
          <Image
            alt="Garden"
            src={GardenImage}
            // Use w-full and h-full to ensure the image covers the background
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="bg-backgroundTransparent mx-auto max-w-2xl rounded-md px-8 py-28 sm:px-12 sm:py-56 lg:px-20 lg:py-56">
              <div className="text-center">
                <Image
                  alt="New Leaf: Cultivating Community Connections Through Gardening"
                  src={HomeText}
                />
                <p className="mt-8 text-pretty text-lg font-medium text-secondary-foreground sm:text-xl/8">
                  Cultivating community connections through gardening.
                </p>

                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <Button
                    onClick={handleScrollToFeatures}
                    className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    Learn More About Us
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About us section */}
        <div id="Features" className="mb-20 mt-32 sm:mt-56">
          <div className="mx-auto max-w-4xl text-left">
            <h2 className="ml-8 text-xl font-semibold tracking-tight text-secondary-foreground sm:text-5xl">
              About New Leaf
            </h2>
            <p className="mt-8 w-[80%] place-self-center text-pretty text-lg font-medium text-secondary-foreground/90 sm:text-xl/8">
              Our goal at New Leaf is to connect individuals in suburban
              communities through gardening. This platform is perfect for those
              looking to meet neighbours with similar interests. On New Leaf,
              you can share your garden space through Plot Management or offer
              your help to a neighbour. Through the Marketplace, sell or donate
              all the extra produce from your garden, unused soils, seeds, etc.
              and receive these supplies from others in your community! Looking
              specifically to share or borrow tools? Tool Sharing is the place
              for you! And you can manage all your gardening tasks through Task
              Management. New Leaf is your one-stop platform for collaborative
              community gardening.
            </p>
          </div>
        </div>

        {/* Extra spacing */}
        <br />
        <br />
      </main>
    </div>
  );
}
