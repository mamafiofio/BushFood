import type { ReactNode } from "react";

/** One block on the Found screen (shared template for every plant). */
export type FoundSection = {
  title: string;
  body: ReactNode;
};

export type FoundPlantCopy = {
  displayName: string;
  sections: FoundSection[];
  wikipediaUrl: string;
};

export const WATTLESEED_FOUND_COPY: FoundPlantCopy = {
  displayName: "The Wattleseed",
  sections: [
    {
      title: "Scientific Name",
      body: (
        <>
          <em>Acacia</em> spp. (e.g. <em>A. victoriae</em>, <em>A. longifolia</em>, <em>A. mearnsii</em>)
        </>
      ),
    },
    {
      title: "Description",
      body: (
        <>
          Roasted, ground seeds from edible wattles — a nutty, coffee-and-chocolate flavoured pantry
          staple. <em>A. longifolia</em> and <em>A. mearnsii</em> are local Victorian species;{" "}
          <em>A. victoriae</em> (Elegant Wattle) is the most commonly used commercial species.
        </>
      ),
    },
    {
      title: "Climate & Position",
      body: (
        <>
          Full sun, well-drained sandy/loamy/gravelly soil. Highly drought-hardy once established.
          Most edible acacias tolerate Victorian conditions; <em>A. longifolia</em> is excellent for
          coastal/sandy gardens, <em>A. mearnsii</em> for cool inland sites.
        </>
      ),
    },
    {
      title: "Care",
      body: (
        <>
          Fast growers, low maintenance. Avoid wet feet. Light prune after flowering to keep
          compact. Trees flower from 2–4 years. No fertiliser needed — acacias fix their own nitrogen.
        </>
      ),
    },
    {
      title: "Harvest Time",
      body: (
        <>
          Summer (Dec–Feb). Pods turn brown and brittle when ready; lay tarp under tree, shake or
          strip pods, then thresh and sieve. Roast seed before use.
        </>
      ),
    },
    {
      title: "How to Use in Cooking",
      body: (
        <>
          Use like instant coffee/cocoa: in damper, bread, scones, biscuits, ice-cream, cheesecake,
          mocha lattes, sauces and dukkah. Pairs beautifully with chocolate, vanilla and stone fruit.
        </>
      ),
    },
  ],
  wikipediaUrl: "https://en.wikipedia.org/wiki/Wattleseed",
};
