"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

const MainSection = () => (
  <main>
    <div className="relative left-[5%] mb-8 mt-10 w-[90%] rounded-md bg-primary px-6 py-6 sm:mt-24 sm:px-8 sm:py-10 lg:px-16 lg:py-12">
      <div className="text-center">
        <h4 className="text-xl font-semibold text-white sm:text-xl md:text-4xl">
          Garden Sharing
        </h4>
      </div>
    </div>
    <LendAndTend />
    <Info />
  </main>
);

const LendAndTend = () => {
  const listingParams = useSearchParams();
  const router = useRouter();

  // reset components: https://upmostly.com/tutorials/how-to-refresh-a-page-or-component-in-react
  if (listingParams?.get("reload") === "true") {
    router.push("/plots/garden-listings?sortCriteria=Recommended+For+You");
    router.refresh();
    return;
  }

  return (
    <>
      <div className="flex flex-col justify-center gap-4 py-4 md:flex-row">
        <div className="mx-4 grid w-[80%] grid-rows-[2fr_1fr] place-self-center rounded-md bg-secondary px-6 py-16 text-secondary-foreground sm:pb-24 md:ml-10 lg:ml-20 2xl:ml-56">
          <div className="row-start-1">
            <h1 className="text-3xl font-semibold md:text-3xl">Lend</h1>
            <h3 className="py-2 font-semibold md:text-sm lg:text-lg">
              Garden space that could use some love?
            </h3>
            <p className="text-sm md:text-xs lg:text-base">
              Create a listing to share your space with eager gardeners...
            </p>
          </div>
          <div>
            <Link href="/plots/add-plot">
              <button className="mt-6 rounded-md bg-customGreen-dark px-4 py-3 text-xs font-semibold text-white shadow-sm md:mt-3 lg:text-sm">
                Create Listing
              </button>
            </Link>
          </div>
        </div>
        <div className="mx-4 grid w-[80%] grid-rows-[2fr_1fr] place-self-center rounded-md bg-secondary px-6 py-16 text-secondary-foreground sm:pb-24 md:mr-10 lg:mr-20 2xl:mr-56">
          <div className="row-start-1">
            <h1 className="text-3xl font-semibold md:text-3xl">Tend</h1>
            <h3 className="py-2 font-semibold md:text-sm lg:text-lg">
              Looking for garden space?
            </h3>
            <p className="text-sm md:text-xs lg:text-base">
              Find a lender near you and get started gardening...
            </p>
          </div>
          <div>
            <Link href="/plots/garden-listings?sortCriteria=Recommended+For+You">
              <button className="mt-6 rounded-md bg-customGreen-dark px-4 py-3 text-xs font-semibold text-white shadow-sm md:mt-3 lg:text-sm">
                View Listings
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="relative left-[10%] mb-2 mt-8 w-[80%] rounded-md bg-secondary px-6 py-8 text-secondary-foreground md:left-[30%] md:mx-4 md:w-[40%]">
        <div>
          <h1 className="text-3xl font-semibold md:text-2xl md:text-lg">
            View your active gardens:
          </h1>
        </div>
        <div>
          <Link href="/plots/management/my-plots">
            <button className="mt-3 rounded-md bg-customGreen-dark px-4 py-3 text-xs font-semibold text-white shadow-sm sm:ml-4 lg:text-sm">
              My Gardens
            </button>
          </Link>
        </div>
      </div>
    </>
  );
};

const Info = () => {
  return (
    <div className="mb-40 mt-10 px-4 py-4 sm:px-10 lg:px-20">
      <div className="ml-4 text-left sm:px-8 lg:ml-20 lg:px-16">
        <h1 className="text-3xl font-semibold lg:text-4xl">
          What is Garden Sharing?
        </h1>
        <p className="text-md mt-10 w-[95%] lg:ml-4 lg:w-[60%] lg:text-xl">
          Garden sharing is an initiative were landowners offer their outdoor
          space to gardeners so that they may grow plants or produce. In most
          cases, both parties will share whatever is produced as an equal
          payment for land and labour (though this isn&apos;t a must, make
          arrangementrs as you see fit). It is strongly recommended for
          gardeners to interview potential tenders to ensure a compatable
          relationship that meets similar interests.
        </p>
        <p className="text-md mt-2 w-[95%] lg:ml-4 lg:w-[60%] lg:text-xl">
          Best of luck with your gardening endevours! As a result, the world
          will be a greener place...
        </p>
      </div>
    </div>
  );
};

export default MainSection;
