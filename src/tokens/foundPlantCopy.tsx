import type { ReactNode } from "react";
import type { HuntPlantId } from "./huntPlantTiles";

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

const FINGER_LIME: FoundPlantCopy = {
  displayName: "Finger Lime",
  sections: [
    {
      title: "Scientific Name",
      body: <em>Citrus australasica</em>,
    },
    {
      title: "Description",
      body: (
        <>
          A thorny rainforest understorey shrub or small tree producing finger-shaped fruits filled with tangy
          juice-filled vesicles known as &apos;lime caviar&apos;. Skin colour ranges from green and yellow to
          crimson and black; flesh can be pale green, pink or ruby.
        </>
      ),
    },
    {
      title: "Climate & Position",
      body: (
        <>
          Naturally subtropical, but with selection now grown successfully in cool-temperate Victoria. Prefers a
          warm, sheltered, frost-free spot in full sun to dappled shade; cool-climate plants do best on a
          north-facing wall.
        </>
      ),
    },
    {
      title: "Care",
      body: (
        <>
          Well-drained, slightly acidic soil (pH 6–7). Mulch in spring, keep moist through summer, light citrus
          fertiliser every 2–3 months. Protect young plants from frost and water deeply but infrequently once
          established.
        </>
      ),
    },
    {
      title: "Harvest Time",
      body: (
        <>
          Late summer to autumn (Feb–May). Fruit doesn&apos;t ripen off the tree — pick when firm, full-coloured and
          detaches with a gentle tug.
        </>
      ),
    },
    {
      title: "Where to Buy (VIC)",
      body: (
        <>
          Bulleen Art &amp; Garden (Bulleen, VIC); Melbourne Bushfood; Kuranga Native Nursery (Mt Evelyn, VIC);
          Edible Eden Design.
        </>
      ),
    },
    {
      title: "How to Use in Cooking",
      body: (
        <>
          Burst the pearls over oysters, sashimi, ceviche, scallops, salads, canapés, gin &amp; tonics or vanilla
          ice-cream. Also brilliant in marmalades, dressings, butters and finishing sauces.
        </>
      ),
    },
  ],
  wikipediaUrl: "https://en.wikipedia.org/wiki/Citrus_australasica",
};

const MURNONG: FoundPlantCopy = {
  displayName: "Murnong",
  sections: [
    {
      title: "Scientific Name",
      body: (
        <>
          <em>Microseris lanceolata</em> / <em>M. walteri</em>
        </>
      ),
    },
    {
      title: "Description",
      body: (
        <>
          Also called Yam Daisy. A small perennial daisy with grass-like leaves and bright yellow nodding flowers,
          producing sweet, milky tubers that were once a staple food across Victoria&apos;s grassy plains and
          woodlands.
        </>
      ),
    },
    {
      title: "Climate & Position",
      body: (
        <>
          Cool-temperate grasslands and open woodland. Full sun in well-drained sandy or loamy soil. Tolerates frost
          and dry summers once established. Reaches 20–50 cm tall.
        </>
      ),
    },
    {
      title: "Care",
      body: (
        <>
          Sow seed in autumn or plant tubestock in spring. Avoid heavy feeding. Let plants die back over summer
          dormancy and resume watering when leaves re-emerge. Leave the main tuber in the ground and harvest only
          off-shoots for repeat crops.
        </>
      ),
    },
    {
      title: "Harvest Time",
      body: (
        <>
          Autumn (Mar–May), once flowers fade and leaves yellow. First-year tubers are small; harvests improve from
          year two.
        </>
      ),
    },
    {
      title: "Where to Buy (VIC)",
      body: (
        <>
          Victorian Indigenous Nurseries Co-operative (Fairfield); Bulleen Art &amp; Garden; Native Plant Project
          (Mornington Peninsula); Edible Oz (seed); Habitat Warriors.
        </>
      ),
    },
    {
      title: "How to Use in Cooking",
      body: (
        <>
          Eat raw (coconutty, grassy), or roast/fry like baby potatoes — they turn slightly salty and sweet. Lovely
          mashed with butter, in salads, pickled, or puréed for desserts.
        </>
      ),
    },
  ],
  wikipediaUrl: "https://en.wikipedia.org/wiki/Microseris_walteri",
};

const KANGAROO_GRASS: FoundPlantCopy = {
  displayName: "Kangaroo Grass",
  sections: [
    {
      title: "Scientific Name",
      body: <em>Themeda triandra</em>,
    },
    {
      title: "Description",
      body: (
        <>
          An iconic Australian tussock grass with red-brown summer seed heads. Of major cultural significance to
          the Dja Dja Wurrung of central Victoria; seeds were ground into a high-protein flour.
        </>
      ),
    },
    {
      title: "Climate & Position",
      body: (
        <>
          Extremely hardy across Victoria. Full sun to part shade, sandy to clay soils. Drought-, frost- and
          fire-tolerant. Forms tufts to 1.5 m tall.
        </>
      ),
    },
    {
      title: "Care",
      body: (
        <>
          Plant from seed or tubestock in spring/autumn. Almost no watering once established. Burn or mow to
          ground level every 2–3 years to rejuvenate. Avoid over-fertilising — it dislikes rich soil.
        </>
      ),
    },
    {
      title: "Harvest Time",
      body: (
        <>
          Early to mid-summer (Dec–Feb) once heads turn dark green/red. Cut whole heads, hang upside down over a
          sheet for a week to drop seed; thresh and winnow.
        </>
      ),
    },
    {
      title: "Where to Buy (VIC)",
      body: (
        <>
          Victorian Indigenous Nurseries Co-operative; Native Seeds (Vic); Victorian Native Seed Co.; D&amp;H Seed
          Harvest Co.; Habitat Warriors.
        </>
      ),
    },
    {
      title: "How to Use in Cooking",
      body: (
        <>
          Roast and grind seed for a nutty, dark flour with ~40% more protein than wheat — use in damper, breads,
          biscuits and porridge. Black Duck Foods sells the flour ready-milled.
        </>
      ),
    },
  ],
  wikipediaUrl: "https://en.wikipedia.org/wiki/Themeda_triandra",
};

const WATTLESEED: FoundPlantCopy = {
  displayName: "Wattleseed",
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
          Roasted, ground seeds from edible wattles — a nutty, coffee-and-chocolate flavoured pantry staple.{" "}
          <em>A. longifolia</em> and <em>A. mearnsii</em> are local Victorian species; <em>A. victoriae</em> (Elegant
          Wattle) is the most commonly used commercial species.
        </>
      ),
    },
    {
      title: "Climate & Position",
      body: (
        <>
          Full sun, well-drained sandy/loamy/gravelly soil. Highly drought-hardy once established. Most edible
          acacias tolerate Victorian conditions; <em>A. longifolia</em> is excellent for coastal/sandy gardens,{" "}
          <em>A. mearnsii</em> for cool inland sites.
        </>
      ),
    },
    {
      title: "Care",
      body: (
        <>
          Fast growers, low maintenance. Avoid wet feet. Light prune after flowering to keep compact. Trees flower
          from 2–4 years. No fertiliser needed — acacias fix their own nitrogen.
        </>
      ),
    },
    {
      title: "Harvest Time",
      body: (
        <>
          Summer (Dec–Feb). Pods turn brown and brittle when ready; lay tarp under tree, shake or strip pods, then
          thresh and sieve. Roast seed before use.
        </>
      ),
    },
    {
      title: "Where to Buy (VIC)",
      body: (
        <>
          Bulleen Art &amp; Garden; Kuranga; Habitat Warriors; Edible Oz (seed); pre-roasted ground wattleseed from
          Aus Superfood Co. and Bush Food Australia.
        </>
      ),
    },
    {
      title: "How to Use in Cooking",
      body: (
        <>
          Use like instant coffee/cocoa: in damper, bread, scones, biscuits, ice-cream, cheesecake, mocha lattes,
          sauces and dukkah. Pairs beautifully with chocolate, vanilla and stone fruit.
        </>
      ),
    },
  ],
  wikipediaUrl: "https://en.wikipedia.org/wiki/Wattleseed",
};

const LILLY_PILLY: FoundPlantCopy = {
  displayName: "Lilly Pilly",
  sections: [
    {
      title: "Scientific Name",
      body: (
        <>
          <em>Syzygium smithii</em> / <em>Syzygium</em> spp.
        </>
      ),
    },
    {
      title: "Description",
      body: (
        <>
          Glossy-leaved evergreen shrub or small tree producing clusters of pink, magenta or red berries with a
          crisp, tart-sweet apple-and-clove flavour. Several species and cultivars are used for hedging across
          Melbourne.
        </>
      ),
    },
    {
      title: "Climate & Position",
      body: (
        <>
          Hardy in most of Victoria; full sun to full shade, tolerates frost and short dry spells once established.
          Likes well-drained soil, sandy to clay.
        </>
      ),
    },
    {
      title: "Care",
      body: (
        <>
          Mulch heavily, water regularly through hot/dry periods. Prune after flowering to shape and to encourage
          bushy growth. Watch for psyllids on some cultivars — choose &apos;resistant&apos; varieties such as{" "}
          <em>Syzygium smithii</em> for low maintenance.
        </>
      ),
    },
    {
      title: "Harvest Time",
      body: <>Late summer to autumn (Feb–May). Pick when berries are fully coloured and slightly soft.</>,
    },
    {
      title: "Where to Buy (VIC)",
      body: (
        <>
          Bulleen Art &amp; Garden; Bunnings; Kuranga Native Nursery; Melbourne Bushfood; most Victorian native
          nurseries.
        </>
      ),
    },
    {
      title: "How to Use in Cooking",
      body: (
        <>
          Eat fresh, or make jams, jellies, syrups, cordials, sauces and chutneys. Excellent paired with pork, duck
          or game; high in vitamin C. Berries freeze well for later use.
        </>
      ),
    },
  ],
  wikipediaUrl: "https://en.wikipedia.org/wiki/Syzygium_smithii",
};

const MIDYIM: FoundPlantCopy = {
  displayName: "Midyim",
  sections: [
    {
      title: "Scientific Name",
      body: <em>Austromyrtus dulcis</em>,
    },
    {
      title: "Description",
      body: (
        <>
          A low, arching shrub (to 40 cm) with fine green-and-bronze foliage and small white-and-purple speckled
          berries with a delicate sweet, gingery, cinnamon-vanilla flavour.
        </>
      ),
    },
    {
      title: "Climate & Position",
      body: (
        <>
          Naturally coastal NSW/QLD but grows well in Victoria with frost protection when young. Full sun to part
          shade; ideal under light tree canopy in Melbourne. Likes free-draining soil with good summer mulch.
        </>
      ),
    },
    {
      title: "Care",
      body: (
        <>
          Keep moist but never waterlogged for the first 12–14 months; thereafter quite drought-tolerant. Mulch
          heavily, light feed of native fertiliser in spring. Tip-prune to keep dense.
        </>
      ),
    },
    {
      title: "Harvest Time",
      body: (
        <>
          Late summer to autumn (Feb–Apr). Berries are ready when soft and fall at a touch — slide a tray underneath
          and shake gently.
        </>
      ),
    },
    {
      title: "Where to Buy (VIC)",
      body: (
        <>
          Melbourne Bushfood; Bulleen Art &amp; Garden; Kuranga Native Nursery; Australian Plants Online; Native
          Foods Nursery.
        </>
      ),
    },
    {
      title: "How to Use in Cooking",
      body: (
        <>
          Beautiful eaten fresh by the handful. Use in fruit salads, pavlovas, muffins, ice-cream, tarts, sorbets
          and gin cocktails. Berries don&apos;t store long — freeze or use within a few days.
        </>
      ),
    },
  ],
  wikipediaUrl: "https://en.wikipedia.org/wiki/Austromyrtus_dulcis",
};

export const FOUND_PLANT_COPY: Record<HuntPlantId, FoundPlantCopy> = {
  fingerlime: FINGER_LIME,
  "kangaroo-grass": KANGAROO_GRASS,
  "lilly-pilly": LILLY_PILLY,
  midyim: MIDYIM,
  murnong: MURNONG,
  wattleseed: WATTLESEED,
};
