"use client";

import React from "react";

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="mb-6">
    <h2 className="text-xl font-semibold mb-3 text-foreground">{title}</h2>
    <div className="space-y-2 text-sm text-foreground/80 leading-relaxed">{children}</div>
  </section>
);

const SubSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="mb-4">
    <h3 className="text-md font-semibold mb-2 text-foreground/90">{title}</h3>
    <div className="space-y-2 text-sm text-foreground/80 leading-relaxed">{children}</div>
  </div>
);

const UL: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ul className="list-disc list-inside space-y-1 pl-4 text-foreground/80">{children}</ul>
);

export const TermsOfServiceText = () => (
  <>
    <p className="mb-4 text-sm text-muted-foreground">
      Welcome to the Venting Platform (“the Platform”, “we”, “our”, or “us”).
      By accessing or using this website and its services, you agree to comply
      with and be bound by these Terms and Conditions. If you do not agree with
      these terms, you should not use the platform.
    </p>

    <Section title="1. Purpose of the Platform">
      <p>
        The Venting Platform is designed to provide users with a safe,
        respectful, and emotionally supportive environment to express their
        thoughts and emotions, either privately or publicly. The platform
        encourages emotional expression, self-reflection, and empathetic
        interaction among users.
      </p>
      <p>
        The platform is not a medical or mental health service and does not
        provide professional advice, diagnosis, or treatment.
      </p>
    </Section>

    <Section title="2. AI Features & Automated Processing Terms">
      <p>
        The platform utilizes automated AI systems to enhance user experience, support content safety, and offer reflective guidance.
      </p>
      <SubSection title="Nature of AI Features">
        <UL>
          <li>AI-generated content (including Reflection Prompts, Mood Summaries, Empathy Checks, and Micro-Action Items) is provided solely for personal wellness and self-reflection.</li>
          <li>AI features do NOT constitute professional psychological, medical, psychiatric, or clinical advice.</li>
          <li>Users must not rely on AI outputs as a substitute for professional mental health assistance.</li>
        </UL>
      </SubSection>
      <SubSection title="Automated Moderation & Safety">
        <UL>
          <li>Submissions may undergo real-time automated AI semantic analysis to detect severe emotional distress, self-harm signals, harassment, or safety violations.</li>
          <li>Automated safety features may present supportive resources or crisis helpline information when distress is detected.</li>
          <li>Automated empathy checking offers suggestions for comments to foster a warm, non-judgmental community environment.</li>
        </UL>
      </SubSection>
    </Section>

    <Section title="3. Eligibility and User Accounts">
      <UL>
        <li>Users must comply with all applicable laws while using the platform.</li>
        <li>
          Some features require account registration using supported
          authentication methods.
        </li>
        <li>
          Users are responsible for maintaining the confidentiality of their
          account credentials.
        </li>
        <li>Anonymous or guest access may have limited features.</li>
        <li>
          We reserve the right to suspend or terminate accounts that violate
          these Terms.
        </li>
      </UL>
    </Section>

    <Section title="4. User Conduct and Community Behavior">
      <p>
        By using the platform, users agree to behave responsibly and
        respectfully.
      </p>
      <SubSection title="Expected Behavior">
        <UL>
          <li>Treat all users with empathy and respect.</li>
          <li>Communicate in a supportive and non-judgmental manner.</li>
          <li>Understand that users may be emotionally vulnerable.</li>
        </UL>
      </SubSection>
      <SubSection title="Prohibited Behavior">
        <p>Users must not:</p>
        <UL>
          <li>Harass, bully, threaten, or insult others.</li>
          <li>Post hate speech or discriminatory content.</li>
          <li>Encourage violence, self-harm, or illegal activities.</li>
          <li>Share explicit sexual content.</li>
          <li>Spam, advertise, or misuse the platform.</li>
          <li>Attempt to bypass moderation or AI safety systems.</li>
        </UL>
        <p>
          Violations may result in content removal, account restrictions, or
          permanent suspension.
        </p>
      </SubSection>
    </Section>

    <Section title="5. Content Guidelines">
      <SubSection title="Venting Content">
        <UL>
            <li>Users may express emotions such as sadness, anger, stress, or frustration.</li>
            <li>Strong emotional language is allowed if not directed at others.</li>
            <li>Users are responsible for the content they post.</li>
        </UL>
      </SubSection>
      <SubSection title="Public Vents and Interactions">
        <UL>
            <li>Public vents are intended to foster empathy and shared understanding.</li>
            <li>Responses must be respectful, supportive, and non-dismissive.</li>
            <li>Harmful advice, judgment, or invalidation of feelings is not permitted.</li>
        </UL>
      </SubSection>
       <SubSection title="Prohibited Content">
        <p>We reserve the right to remove content that:</p>
        <UL>
            <li>Violates these Terms or community guidelines</li>
            <li>Poses a safety risk to users</li>
            <li>Is unlawful or harmful</li>
        </UL>
      </SubSection>
    </Section>

    <Section title="6. Self-Harm and Crisis Content">
        <p>Expressions of emotional distress are allowed.</p>
        <p>Content that promotes, encourages, or instructs self-harm or suicide is strictly prohibited.</p>
        <p>If content indicates severe emotional distress, our automated AI and safety systems may provide supportive resources or crisis information.</p>
        <p>The platform does not replace professional mental health care. Users in crisis should seek immediate professional help.</p>
    </Section>

     <Section title="7. Privacy and Data Use">
        <p>We collect and store user data only as required to operate the platform.</p>
        <p>Users control whether their vents are private, public, or anonymous.</p>
        <p>All AI processing is executed transiently in isolated server environments with zero model-training retention.</p>
        <p>All data handling is governed by our Privacy Policy.</p>
    </Section>

    <Section title="8. Moderation and Reporting">
        <p>Users may report content or behavior that violates these Terms.</p>
        <p>Reports are reviewed using automated AI evaluation and human moderation review.</p>
        <p>Moderation actions may include warnings, content removal, or account restrictions.</p>
        <p>Abuse of reporting features may result in action against the reporting user.</p>
    </Section>

    <Section title="9. Advertisements and Monetization">
        <p>Advertisements may appear in certain non-intrusive areas of the platform.</p>
        <p>Venting and emotional expression pages are kept free from disruptive ads.</p>
        <p>Ads do not use vent content or AI insights for emotional or personalized ad targeting.</p>
    </Section>

    <Section title="10. Intellectual Property">
        <p>All platform content, design, code, and AI architecture are owned by or licensed to the platform.</p>
        <p>Users retain ownership of their own written vents and comments but grant the platform a limited license to process it for functionality, AI safety evaluation, and rendering.</p>
    </Section>

    <Section title="11. Limitation of Liability">
        <p>The platform and its AI features are provided “as is” without warranties of any kind.</p>
        <p>We are not responsible for user-generated content or automated AI reflection suggestions.</p>
        <p>We are not liable for emotional distress, loss, or damages arising from platform or AI tool usage.</p>
    </Section>
    
    <Section title="12. Termination of Access">
        <p>We reserve the right to suspend or terminate access for violations of these Terms or misuse of automated features.</p>
    </Section>

    <Section title="13. Changes to Terms">
        <p>These Terms may be updated periodically to reflect changes in functionality, law, or AI safety requirements. Continued use of the platform constitutes acceptance of updated terms.</p>
    </Section>

    <div className="mt-8 pt-4 border-t border-white/10">
        <h3 className="font-bold text-center">Final Notice</h3>
        <p className="text-center text-sm text-muted-foreground">This platform is built on trust, empathy, and safety. Users are expected to act responsibly and respectfully while using the website and its services.</p>
    </div>
  </>
);

export const PrivacyPolicyText = () => (
  <>
    <p className="mb-4 text-sm text-muted-foreground">
        This Privacy Policy explains how the Venting Platform (“we”, “our”, “us”) collects, uses, stores, and protects user information, including explicit guarantees regarding automated AI data processing. By using the platform, you agree to the practices described in this Privacy Policy.
    </p>

    <Section title="1. AI Data Privacy & Processing Guarantees">
        <p className="font-medium text-foreground">We prioritize your emotional data privacy above all else:</p>
        <SubSection title="a) Zero Model Training Retention">
            <p>
                Your written vents, private feelings, mood logs, and comments are **NEVER used to train, retrain, or improve third-party or commercial AI models**.
            </p>
        </SubSection>
        <SubSection title="b) Serverless Transient Processing">
            <p>
                All AI features (Content Safety Analysis, Empathy Checks, Reflection Prompts, Mood Summaries, Micro-Action Items, Multilingual Processing) are executed inside secure, isolated Serverless Actions on backend servers.
            </p>
            <p>
                Input text is processed transiently in memory for the exact duration of your request and is discarded immediately after generating safety flags or reflective outputs.
            </p>
        </SubSection>
        <SubSection title="c) No Emotional Ad Targeting">
            <p>
                We do not sell, license, or share user emotional data or AI insights with advertisers or third-party brokers. AI analysis is used strictly for real-time safety, empathy support, and personal wellness features.
            </p>
        </SubSection>
        <SubSection title="d) Fail-Safe Execution">
            <p>
                Automated client pre-filters and fallback handlers ensure that if AI servers experience latency, your vent or comment posts safely without losing your data.
            </p>
        </SubSection>
    </Section>

    <Section title="2. Information We Collect">
        <SubSection title="a) Account Information">
            <p>When you sign in using supported authentication methods, we may collect:</p>
            <UL>
                <li>User ID</li>
                <li>Display name</li>
                <li>Email address (if provided)</li>
                <li>Authentication provider (Google / Apple)</li>
                <li>Account creation date</li>
            </UL>
        </SubSection>
        <SubSection title="b) User-Generated Content">
            <p>We collect content you choose to share, including:</p>
            <UL>
                <li>Vents (private or public)</li>
                <li>Mood values associated with vents</li>
                <li>Comments on public vents</li>
                <li>Profile picture URLs</li>
                <li>Reports submitted by users</li>
            </UL>
        </SubSection>
         <SubSection title="c) Usage & Technical Data">
            <p>We may collect limited technical data such as device type, browser analytics, and crash logs to improve app performance and stability.</p>
        </SubSection>
    </Section>

    <Section title="3. How We Use Your Information">
         <p>We use collected data to:</p>
            <UL>
                <li>Provide core app functionality and store private vents</li>
                <li>Enable public interaction and community features where chosen</li>
                <li>Execute real-time AI safety moderation and empathy evaluation</li>
                <li>Generate personal dashboard mood insights upon request</li>
                <li>Ensure community safety and prevent harassment</li>
            </UL>
    </Section>

    <Section title="4. Public vs Private Content">
        <UL>
            <li>Private vents are encrypted and visible only to you.</li>
            <li>Public vents are visible to other users based on your settings.</li>
            <li>Anonymous posting hides personal identifiers from public view.</li>
        </UL>
    </Section>

    <Section title="5. Data Storage & Security">
        <UL>
            <li>User data is securely stored using Firebase infrastructure.</li>
            <li>Database security rules ensure private data remains accessible only to authorized accounts.</li>
            <li>We enforce strict encryption standards in transit and at rest.</li>
        </UL>
    </Section>

     <Section title="6. User Rights & Control">
        <p>Users have the right to:</p>
        <UL>
            <li>Edit or delete their content at any time</li>
            <li>Delete their account and associated data</li>
            <li>Control privacy and visibility settings</li>
        </UL>
    </Section>
    
    <Section title="7. Children’s Privacy">
        <p>This platform is not intended for children under the age required by applicable laws. We do not knowingly collect data from minors.</p>
    </Section>

    <Section title="8. Updates to Policy">
        <p>This policy may be updated to reflect new platform features, AI architecture enhancements, or legal requirements. Continued platform use constitutes acceptance of updated terms.</p>
    </Section>

    <div className="mt-8 pt-4 border-t border-white/10">
        <h3 className="font-bold text-center">Final Note on Trust</h3>
        <p className="text-center text-sm text-muted-foreground">This platform is built to respect emotional privacy and user dignity. Your data belongs to you, and emotional expression is treated with care, transparency, and utmost responsibility.</p>
    </div>
  </>
);

export const LegalNotesText = () => (
  <>
    <p className="mb-4 text-sm text-muted-foreground">
      These Legal Notes provide clear technical details regarding platform governance, AI architecture, intellectual property, and user privacy compliance.
    </p>

    <Section title="1. AI Architecture & Execution Model">
      <p>
        Venting operates a modern serverless AI architecture designed for privacy, high throughput, and data isolation.
      </p>
      <UL>
        <li>**Serverless Isolation:** All AI flows run exclusively inside stateless backend server actions.</li>
        <li>**Transient Memory Processing:** Text payloads are processed in volatile RAM only for the duration of inference.</li>
        <li>**Zero Persistence in AI Engine:** AI endpoints do not retain log histories or training data of user inputs.</li>
        <li>**Automated Fallback Net:** Pre-filtering ensures client operations complete reliably even during external network latencies.</li>
      </UL>
    </Section>

    <Section title="2. Intellectual Property & Ownership">
      <UL>
        <li>Users retain full copyright and ownership of their original vent text, reflections, and comments.</li>
        <li>The platform grants users a personal, non-exclusive license to use AI-generated reflection prompts, mood insights, and micro-action items for personal wellness purposes.</li>
        <li>All platform software, source code, UI designs, and logos are protected by copyright laws.</li>
      </UL>
    </Section>

    <Section title="3. Health & Medical Disclaimer">
      <p>
        Venting and its AI features are informational self-help tools and do not provide medical advice, psychiatric diagnosis, or emergency intervention.
      </p>
      <p>
        If you are experiencing a mental health crisis or emergency, please contact your local emergency services or a qualified healthcare provider immediately.
      </p>
    </Section>

    <Section title="4. Transparency & Release Logs">
      <p>
        We maintain full operational transparency regarding platform updates, AI pipeline enhancements, and release logs. You can inspect all release history on our official **[Update Log & AI Transparency Hub](/updates)** page.
      </p>
    </Section>

    <div className="mt-8 pt-4 border-t border-white/10">
        <h3 className="font-bold text-center">Legal Notice</h3>
        <p className="text-center text-sm text-muted-foreground">For legal inquiries, compliance requests, or data protection questions, please reach out through our official platform channels.</p>
    </div>
  </>
);
