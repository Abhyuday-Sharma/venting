const adjectives = [
  "Quiet", "Silent", "Serene", "Peaceful", "Calm", "Brave", "Strong", "Kind",
  "Hidden", "Gentle", "Wandering", "Soft", "Bright", "Glowing", "Wild",
  "Resilient", "Eager", "Patient", "Hidden", "Humble", "Free", "Dreamy"
];

const nouns = [
  "Mountain", "Ocean", "River", "Forest", "Tree", "Leaf", "Wind", "Cloud",
  "Star", "Moon", "Sun", "Fox", "Bird", "Lion", "Tiger", "Bear", "Wolf",
  "Deer", "Panda", "Valley", "Desert", "Cactus", "Eagle", "Falcon"
];

export function generateIncognitoName() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
}

export function getIncognitoAvatar(name: string) {
  // Using DiceBear shapes or bottts style for a distinct pseudonymous look.
  // The seed makes it consistent for the same name.
  return `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(name)}`;
}
