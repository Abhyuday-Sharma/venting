/**
 * Guides: long-form, evergreen articles published at /guides/[slug].
 *
 * Content is kept as structured blocks rather than markdown so it renders as
 * plain server HTML with no extra dependencies. To add a guide, append an entry
 * to GUIDES. The index page, article route, and sitemap all read from here.
 *
 * Editorial rules for anything added here: original writing, no diagnosis or
 * treatment advice, no statistics without a source, and no specific crisis
 * numbers unless they have been verified for the reader's country.
 */

export type GuideBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "note"; text: string };

export interface Guide {
  slug: string;
  title: string;
  /** One or two sentences; used for the meta description and index card. */
  description: string;
  /** ISO date (YYYY-MM-DD). */
  published: string;
  updated?: string;
  body: GuideBlock[];
}

export const GUIDES: Guide[] = [
  {
    slug: "why-venting-can-feel-relieving",
    title: "Why Venting Can Feel Relieving",
    description:
      "Putting a feeling into words often makes it feel smaller. Here is why venting can help, when it stops helping, and how to vent in a way that leaves you lighter.",
    published: "2026-09-22",
    body: [
      {
        type: "p",
        text: "Most people know the feeling: something has been building all day, you finally say it out loud or write it down, and your shoulders drop a little. Nothing about the situation has changed, but it feels more manageable. That shift is real, and understanding where it comes from can help you use it on purpose.",
      },
      { type: "h2", text: "Naming a feeling changes how it sits with you" },
      {
        type: "p",
        text: "When a feeling stays unspoken, it tends to stay vague. You carry a general sense of \"everything is wrong\" without knowing exactly what the everything is. Putting it into words forces you to be specific: I am angry that my work was dismissed in front of the team. I am scared that this relationship is ending. A specific feeling is easier to hold than a shapeless one, because you can see its edges.",
      },
      {
        type: "p",
        text: "Psychologists have studied this for decades. Research on expressive writing, much of it started by James Pennebaker in the 1980s, has looked at what happens when people write about difficult experiences for short, regular sessions. The results vary between studies and people, but many participants describe feeling clearer and less weighed down afterwards. The writing itself seems to matter: turning a jumble of emotion into sentences asks your mind to organise it.",
      },
      { type: "h2", text: "It lets the feeling finish" },
      {
        type: "p",
        text: "Emotions tend to rise, peak, and fall when they are allowed to run their course. Pushing a feeling down usually doesn't make it disappear; it just postpones it, often to a worse moment. Venting gives the feeling somewhere to go. Once it has been expressed, many people find it loosens its grip, and they can think about the situation more calmly.",
      },
      { type: "h2", text: "Being heard, even a little, helps" },
      {
        type: "p",
        text: "Part of the relief comes from feeling witnessed. That can be a friend who listens without jumping to advice, or a stranger who leaves a kind reply on a post. It can even be the page itself. Knowing that what you feel has been acknowledged, even once, can make it feel less isolating.",
      },
      { type: "h2", text: "When venting stops helping" },
      {
        type: "p",
        text: "Venting is not always helpful. It can turn into going round in circles: repeating the same grievance, getting angrier each time, and walking away more wound up than before. A few signs that venting has tipped into rumination:",
      },
      {
        type: "ul",
        items: [
          "You feel worse after venting, not lighter, and this happens repeatedly.",
          "You keep telling the same story with the same words, and nothing new comes out of it.",
          "Venting has replaced dealing with the problem, rather than helping you get ready to deal with it.",
          "You are mostly looking for someone to agree that another person is terrible.",
        ],
      },
      {
        type: "p",
        text: "If that sounds familiar, you don't have to stop expressing yourself. Try changing what you write about instead, as described below.",
      },
      { type: "h2", text: "How to vent so you come out lighter" },
      {
        type: "ul",
        items: [
          "Start with the facts, then the feeling. \"What happened\" first, then \"how it made me feel\". Separating the two often makes the feeling easier to look at.",
          "Give it a time limit. Ten or fifteen minutes is usually enough. The point is to release the pressure, not to relive the whole thing.",
          "End with one small question: what do I need right now? Rest, a conversation, a boundary, a walk? You don't have to act on it. Just noticing is a good way to close.",
          "Be kind in how you describe yourself. It is fine to be furious at a situation. Try not to turn the anger on yourself.",
          "Decide who sees it. Some things are best kept private. Sharing publicly can bring support, but only share what you are comfortable with strangers reading.",
        ],
      },
      { type: "h2", text: "A place to start" },
      {
        type: "p",
        text: "If you have something on your mind right now, try writing three sentences: what happened, how it felt, and what you wish had been different. That is enough. You can come back to it later, keep it private, or let it go completely.",
      },
      {
        type: "note",
        text: "Venting is a way to look after yourself, not a replacement for professional care. If your feelings are overwhelming, persistent, or frightening, please talk to a doctor or a mental-health professional you trust.",
      },
    ],
  },
  {
    slug: "how-to-journal-when-overwhelmed",
    title: "How to Journal When Your Mind Feels Overwhelmed",
    description:
      "When your thoughts are racing, a blank page can feel like one more demand. These low-effort journaling methods help you get things out of your head without needing the right words.",
    published: "2026-09-22",
    body: [
      {
        type: "p",
        text: "Journaling advice often assumes you have a calm half hour and something tidy to say. Overwhelm doesn't work like that. Your thoughts jump around, everything feels urgent, and a blank page can feel like one more thing you are failing at. The good news is that journaling doesn't need to be neat to be useful. It just needs to move some of what is in your head onto the page.",
      },
      { type: "h2", text: "Lower the bar first" },
      {
        type: "p",
        text: "Before you write anything, give yourself permission to do it badly. Nobody is marking this. Spelling, grammar, full sentences, and making sense are all optional. If you only manage two lines, that still counts. Overwhelm makes everything feel high-stakes, and it helps to make this one thing deliberately low-stakes.",
      },
      { type: "h2", text: "Method 1: The brain dump" },
      {
        type: "p",
        text: "Set a timer for five minutes and write down everything that is taking up space in your head, in whatever order it arrives. Tasks, worries, half-thoughts, things someone said, things you forgot to do. Don't sort or explain them. Just list them.",
      },
      {
        type: "p",
        text: "When the timer ends, look at the list. It is almost always shorter than it felt. Some items will be things you can't control; you might mark those with a dash. Others might be one small action; mark those with a star. You haven't solved anything yet, but you have turned a cloud into a list, and a list is easier to face.",
      },
      { type: "h2", text: "Method 2: Three questions" },
      {
        type: "p",
        text: "If free writing feels like too much, answer three short questions instead:",
      },
      {
        type: "ul",
        items: [
          "What am I feeling right now? (One or two words is fine: tense, flat, scared, irritated.)",
          "What is the biggest thing on my mind?",
          "What is one thing that would make the next hour slightly easier?",
        ],
      },
      {
        type: "p",
        text: "The last question is the important one. It points you towards something small and doable, like drinking water, sending one email, or stepping outside. It avoids trying to fix everything at once.",
      },
      { type: "h2", text: "Method 3: Write it to someone" },
      {
        type: "p",
        text: "Sometimes it is easier to write to a person than to a page. Write a letter you will never send, to a friend, to someone who upset you, or to yourself a year from now. Addressing someone gives your thoughts a direction, and it can bring out things you didn't know you wanted to say. When you are done, you can keep it, delete it, or tear it up. The value was in the writing.",
      },
      { type: "h2", text: "Method 4: Facts on the left, feelings on the right" },
      {
        type: "p",
        text: "Split the page in two. On the left, write only what actually happened, the things a camera would have recorded. On the right, write what you felt and what you told yourself about it. Overwhelm often comes from the right-hand column running far ahead of the left. Seeing them side by side can show where a hard situation has grown into a catastrophe in your head.",
      },
      { type: "h2", text: "Making it a habit, gently" },
      {
        type: "ul",
        items: [
          "Tie it to something you already do, like after your morning tea or before you put your phone down at night.",
          "Keep it short. A few minutes most days helps more than an hour once a month.",
          "Keep it somewhere private. You will write more honestly if you know nobody else will read it.",
          "Don't reread in the middle of a bad day if it pulls you down. Old entries can wait until you feel steadier.",
        ],
      },
      { type: "h2", text: "When journaling isn't enough" },
      {
        type: "p",
        text: "Journaling is a good way to understand what you are carrying. It is not meant to carry it all for you. If you notice the same heavy themes coming up week after week, or you find it hard to cope with daily life, that is a sign to talk to someone: a trusted person in your life, a doctor, or a counsellor.",
      },
      {
        type: "note",
        text: "This guide is general information, not medical advice. If you are struggling to cope, please reach out to a healthcare professional. If you are in danger, contact your local emergency services.",
      },
    ],
  },
  {
    slug: "healthy-ways-to-deal-with-everyday-stress",
    title: "Healthy Ways to Deal With Everyday Stress",
    description:
      "Deadlines, bills, family, commuting. Everyday stress adds up. These practical habits help you let off pressure before it builds into something bigger.",
    published: "2026-09-22",
    body: [
      {
        type: "p",
        text: "Not all stress comes from big events. A lot of it is ordinary: a tight deadline, a difficult conversation you keep putting off, money that doesn't quite stretch, a commute that eats your evening. None of these is a crisis on its own, but together they can leave you tense, tired, and short-tempered. The aim isn't to remove stress entirely, which isn't possible. It is to give it regular ways out so it doesn't pile up.",
      },
      { type: "h2", text: "Notice your early signs" },
      {
        type: "p",
        text: "Stress usually shows up in the body before we name it. Common early signs include a tight jaw or shoulders, shallow breathing, trouble falling asleep, snapping at people, reaching for your phone constantly, or forgetting simple things. Everyone's pattern is different. Learning yours means you can act when stress is still small, rather than when you are already overwhelmed.",
      },
      { type: "h2", text: "Separate what you can change from what you can't" },
      {
        type: "p",
        text: "Write down what is stressing you, then sort it into two lists: things you can influence, and things you can't. For the first list, pick one small next step for each item. For the second, the work is different: accepting that it is out of your hands, and choosing how much attention to give it. This won't make problems disappear, but it stops you spending energy on things that won't respond to it.",
      },
      { type: "h2", text: "Move your body, even briefly" },
      {
        type: "p",
        text: "Physical activity is one of the most reliable ways people report letting off stress. It doesn't need to be a workout. A ten-minute walk, stretching between tasks, or climbing the stairs instead of taking the lift all count. Movement gives the restless energy that stress produces somewhere to go.",
      },
      { type: "h2", text: "Breathe slower than you want to" },
      {
        type: "p",
        text: "When you are stressed, breathing tends to get quick and shallow. Deliberately slowing it down, especially the out-breath, is a simple way to signal to yourself that you are safe. Try breathing in for a count of four and out for a count of six, for a minute or two. It is quiet enough to do at a desk or on a bus.",
      },
      { type: "h2", text: "Protect the basics" },
      {
        type: "ul",
        items: [
          "Sleep: aim for a regular bedtime, and give yourself some screen-free time before it.",
          "Food: stress makes it easy to skip meals or live on snacks. Regular, simple meals help keep your energy and mood steadier.",
          "Caffeine and alcohol: both can make stress feel worse, especially in the evening. Notice how they affect you.",
          "Breaks: short pauses during the day help more than waiting for a weekend to recover.",
        ],
      },
      { type: "h2", text: "Get it out of your head" },
      {
        type: "p",
        text: "Stress feels bigger when it just circles in your thoughts. Talking to someone you trust, writing in a journal, or venting privately can all help you see it more clearly. Often, once a worry is written down, you can see it is one specific problem rather than a general sense of dread. A specific problem is much easier to work on.",
      },
      { type: "h2", text: "Set small boundaries" },
      {
        type: "p",
        text: "A lot of everyday stress comes from saying yes to too much. You don't have to overhaul your life to change this. Try one small boundary this week: not checking work messages after a certain time, saying \"let me get back to you\" instead of agreeing straight away, or keeping one evening free. Small boundaries, kept consistently, add up.",
      },
      { type: "h2", text: "Watch for stress that doesn't ease" },
      {
        type: "p",
        text: "Everyday stress normally goes up and down. If yours stays high for weeks, affects your sleep or appetite, or starts to make ordinary things feel impossible, it is worth taking seriously. Talk to your doctor or a mental-health professional. Asking for help early is a sensible step, not an overreaction.",
      },
      {
        type: "note",
        text: "This guide offers general wellbeing information and is not a substitute for professional advice. If stress is affecting your health or daily life, please speak to a qualified professional. In an emergency, contact your local emergency services.",
      },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

/** Rough reading time at ~220 words per minute, minimum one minute. */
export function readingMinutes(guide: Guide): number {
  const words = guide.body
    .flatMap((b) => (b.type === "ul" ? b.items : [b.text]))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
