
const moderationIntents = {
  "intents": [
    {
      "tag": "self_harm_expression",
      "description": "User expressing emotional pain, hopelessness, or distress WITHOUT encouraging harm",
      "applies_to": ["vent"],
      "severity": "low",
      "patterns": [
        "i feel empty",
        "i feel hopeless",
        "i am tired of everything",
        "nothing feels right",
        "i dont want to exist",
        "i feel broken",
        "i feel numb"
      ],
      "action": {
        "publish": true,
        "safetyFlag": false,
        "commentsEnabled": true,
        "showSupportMessage": false
      }
    },
    {
      "tag": "self_harm_risk",
      "description": "User expressing intense distress or passive death wishes (no encouragement)",
      "applies_to": ["vent"],
      "severity": "medium",
      "patterns": [
        "i wish i could disappear",
        "i dont want to wake up",
        "everything would be better without me",
        "i cant handle this anymore",
        "im at my limit",
        "want to die",
        "kill myself",
        "end my life",
        "don't want to be here anymore",
        "give up on life",
        "better off dead",
        "killing myself",
        "take my own life",
        "end it all",
        "ending it all",
        "dont want to live",
        "dont want to be alive",
        "no reason to live",
        "nothing to live for",
        "wish i was dead",
        "wish i were dead",
        "want to be dead",
        "suicidal",
        "commit suicide",
        "suicide note",
        "suicide methods",
        "harm myself",
        "self harm",
        "self-harm",
        "cant take it anymore",
        "cant take it no more",
        "cant take this anymore",
        "cant go on",
        "how to die",
        "ways to die",
        "painless death",
        "painless way to die",
        "die without pain",
        "death methods",
        "methods to die",
        "marna chahta",
        "marna chahti",
        "jeene ka mann nahi",
        "khudkushi"
      ],
      "action": {
        "publish": true,
        "safetyFlag": true,
        "commentsEnabled": false,
        "showSupportMessage": true
      }
    },
    {
      "tag": "self_harm_encouragement",
      "description": "Encouraging or validating suicide or self-harm",
      "applies_to": ["comment"],
      "severity": "critical",
      "patterns": [
        "you should kill yourself",
        "just do it",
        "ending it is the solution",
        "self harm helps",
        "it will be better if you die",
        "k*ll urself",
        "go die",
        "end your life",
        "you should die",
        "drink bleach"
      ],
      "action": {
        "publish": false,
        "blockImmediately": true,
        "incrementWarning": true,
        "autoBanAfterWarnings": 2
      }
    },
    {
      "tag": "self_harm_instruction",
      "description": "Providing instructions, methods, or guidance for self-harm",
      "applies_to": ["comment"],
      "severity": "critical",
      "patterns": [
        "here is how you do it",
        "this is the best way",
        "you should try this method",
        "this works every time",
        "how to k*ll myself",
        "painless suicide"
      ],
      "action": {
        "publish": false,
        "blockImmediately": true,
        "incrementWarning": true,
        "autoBanAfterWarnings": 1
      }
    },
    {
      "tag": "harassment_or_hate",
      "description": "Direct harassment, hate, or abusive language",
      "applies_to": ["comment", "vent"],
      "severity": "high",
      "patterns": [
        "you are useless",
        "no one cares about you",
        "stop whining",
        "you deserve this",
        "you are pathetic"
      ],
      "action": {
        "publish": false,
        "incrementWarning": true,
        "autoHide": true
      }
    },
    {
      "tag": "supportive_response",
      "description": "Supportive, empathetic responses",
      "applies_to": ["comment"],
      "severity": "none",
      "patterns": [
        "you are not alone",
        "i hear you",
        "sending strength",
        "i am here for you",
        "thank you for sharing"
      ],
      "action": {
        "publish": true,
        "boostVisibility": false
      }
    },
    {
      "tag": "spam_or_trolling",
      "description": "Spam, nonsense, or repeated disruptive content",
      "applies_to": ["comment", "vent"],
      "severity": "medium",
      "patterns": [
        "buy now",
        "click this link",
        "subscribe to",
        "this is fake",
        "lol who cares"
      ],
      "action": {
        "publish": false,
        "autoHide": true
      }
    }
  ]
};

const { intents } = moderationIntents;

export type Intent = typeof intents[0];

export type IntentAction = {
    publish: boolean;
    safetyFlag?: boolean;
    commentsEnabled?: boolean;
    showSupportMessage?: boolean;
    blockImmediately?: boolean;
    incrementWarning?: boolean;
    autoBanAfterWarnings?: number;
    autoHide?: boolean;
    boostVisibility?: boolean;
};

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:'"’()]/g, '');
};

const findMatch = (text: string, appliesTo: 'vent' | 'comment'): Intent | null => {
  const normalizedText = normalizeText(text);

  const applicableIntents = intents.filter(intent =>
    (intent.applies_to as string[]).includes(appliesTo)
  );

  const severityOrder: { [key: string]: number } = { critical: 5, high: 4, medium: 3, low: 2, none: 1 };
  applicableIntents.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);

  for (const intent of applicableIntents) {
    for (const pattern of intent.patterns) {
      const regex = new RegExp(`\\b${normalizeText(pattern)}\\b`, 'i');
      if (regex.test(normalizedText)) {
        return intent as Intent;
      }
    }
  }
  return null;
};

export const checkVent = (text: string): IntentAction => {
    const match = findMatch(text, 'vent');
    if (match) {
        // Vents are never blocked for harassment, they just aren't published.
        if (match.severity === 'high' || match.severity === 'medium') {
            // Self-harm risk is kept private too (owner's decision), but the writer
            // must still see crisis support before it saves.
            if (match.tag === 'self_harm_risk') {
                return { publish: false, safetyFlag: true, showSupportMessage: true };
            }
            return { publish: false };
        }
        return match.action as IntentAction;
    }
    // Default action for vents
    return {
        publish: true,
        safetyFlag: false,
        commentsEnabled: true,
        showSupportMessage: false,
    };
};

export const checkComment = (text: string): IntentAction => {
    const match = findMatch(text, 'comment');
    if (match) {
        return match.action as IntentAction;
    }
    // Default action for comments
    return {
        publish: true,
    };
}
