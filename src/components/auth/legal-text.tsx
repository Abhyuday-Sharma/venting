"use client";

import React from "react";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/site-config";

const ExternalLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
    {children}
  </a>
);

const ContactEmail = () => (
  <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-foreground">
    {CONTACT_EMAIL}
  </a>
);

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
        <li>
          You must be at least 13 years old to use the platform. If you are in the
          European Economic Area, you must be at least 16, or the lower minimum age
          of digital consent set by your country, if one applies.
        </li>
        <li>The platform is intended for a general audience and is not directed at children.</li>
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
            <li>Users are responsible for the content they post, including vents, comments and profile details.</li>
            <li>Do not post other people&apos;s personal information or anything you do not have the right to share.</li>
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
        <p>We reserve the right to remove, hide, or restrict the visibility of content that:</p>
        <UL>
            <li>Violates these Terms or community guidelines</li>
            <li>Poses a safety risk to users</li>
            <li>Is unlawful or harmful</li>
        </UL>
        <p>We may moderate content at any time, with or without notice, and we are not obliged to keep any content available.</p>
      </SubSection>
    </Section>

    <Section title="6. Self-Harm and Crisis Content">
        <p>Expressions of emotional distress are allowed.</p>
        <p>Content that promotes, encourages, or instructs self-harm or suicide is strictly prohibited.</p>
        <p>If content indicates severe emotional distress, our automated AI and safety systems may provide supportive resources or crisis information.</p>
        <p>Public vents that our safety systems flag for severe distress may have interactions limited, and are not shown to visitors who are not signed in.</p>
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
        <p>Signed-in users can report a vent or comment using the flag icon. Anyone, including visitors without an account, can report content through our <Link href="/contact" className="underline hover:text-foreground">Contact page</Link>.</p>
        <p>Reports are reviewed using automated AI evaluation and human moderation review. Reported content may be hidden while it is under review.</p>
        <p>Automated safety systems may also review content when it is submitted, before any report is made.</p>
        <p>Moderation actions may include warnings, content removal, or account restrictions.</p>
        <p>Repeated or serious violations may result in escalating restrictions, including temporary or permanent suspension.</p>
        <p>Abuse of reporting features may result in action against the reporting user.</p>
    </Section>

    <Section title="9. Advertisements and Monetization">
        <p>Advertisements, which may be served by Google AdSense, may appear in certain non-intrusive areas of the platform, such as informational pages and guides.</p>
        <p>Venting and emotional expression pages are kept free from ads, including the vent composer, your dashboard and mood tracking, and any crisis or support messages.</p>
        <p>We do not use vent content or AI insights for emotional or personalized ad targeting. How advertising cookies work, and how to opt out, is explained in our <Link href="/legal/privacy-policy" className="underline hover:text-foreground">Privacy Policy</Link>.</p>
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

    <Section title="14. Contact">
        <p>Questions about these Terms, or reports about content, can be sent to <ContactEmail /> or through our <Link href="/contact" className="underline hover:text-foreground">Contact page</Link>.</p>
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
        This Privacy Policy explains how the Venting Platform (“we”, “our”, “us”) collects, uses, stores, and protects user information, including how automated AI processing, cookies, analytics, and advertising work on the platform. By using the platform, you agree to the practices described in this Privacy Policy.
    </p>

    <Section title="1. AI Data Privacy & Processing">
        <p className="font-medium text-foreground">We prioritize your emotional data privacy above all else:</p>
        <SubSection title="a) Zero Model Training Retention">
            <p>
                Your written vents, private feelings, mood logs, and comments are <strong>never used by Venting to train, retrain, or improve AI models</strong>.
            </p>
        </SubSection>
        <SubSection title="b) Serverless Transient Processing">
            <p>
                All AI features (Content Safety Analysis, Empathy Checks, Reflection Prompts, Mood Summaries, Micro-Action Items, Multilingual Processing) are executed inside isolated server actions on our backend. Text is sent to our AI model provider (Groq) only to produce the requested result.
            </p>
            <p>
                Venting does not store the text of these AI requests separately from the vent or comment itself. Our AI provider handles the request under its own terms and data policies.
            </p>
        </SubSection>
        <SubSection title="c) Emotional Content Is Never Used for Advertising">
            <p>
                We do not sell, license, or share your vents, comments, mood logs, or AI safety and moderation results with advertisers or data brokers, and we never use them to target ads. Advertising on the platform works separately, through cookies, as explained in Section 7.
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
            <p>We collect limited technical data, such as device type, browser type, pages visited, and crash logs, to improve app performance and stability. See Section 6 (Analytics).</p>
        </SubSection>
        <SubSection title="d) Guest Data Stored on Your Device">
            <p>If you write vents without an account, they are saved only in your browser&apos;s local storage on your device. They are not uploaded to our servers, and clearing your browser data deletes them.</p>
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
                <li>Understand how the platform is used, so we can improve it</li>
                <li>Show advertising on eligible pages, as described in Section 7</li>
            </UL>
    </Section>

    <Section title="4. Public vs Private Content">
        <UL>
            <li>Private vents are visible only to you. Authorized administrators can access them only where needed to process deletion, legal, or safety requests.</li>
            <li>Public vents are visible to anyone who visits the platform, including visitors without an account, based on your settings.</li>
            <li>Anonymous posting hides personal identifiers from public view.</li>
        </UL>
    </Section>

    <Section title="5. Cookies & Local Storage">
        <p>Cookies and similar technologies (such as browser local storage) are small pieces of data stored on your device. We and our service providers use them for the following purposes:</p>
        <UL>
            <li><strong>Essential:</strong> keeping you signed in (Firebase Authentication), and remembering guest vents and preferences such as your theme choice.</li>
            <li><strong>Analytics:</strong> measuring how the platform is used (Google Analytics for Firebase).</li>
            <li><strong>Advertising:</strong> serving and measuring ads, where ads are shown (Google AdSense).</li>
        </UL>
        <p>You can block or delete cookies in your browser settings. Blocking essential storage may stop sign-in or guest vents from working.</p>
    </Section>

    <Section title="6. Analytics">
        <p>We use Google Analytics for Firebase to understand aggregate usage, such as which pages are visited and which devices are used. It collects device and usage information and an app-instance identifier. It does not receive the text of your vents or comments.</p>
        <p>
            Learn more in{" "}
            <ExternalLink href="https://policies.google.com/technologies/partner-sites">How Google uses information from sites or apps that use its services</ExternalLink>.
        </p>
    </Section>

    <Section title="7. Advertising">
        <p>We may use Google AdSense to show ads on certain pages, such as informational pages and guides. We do not show ads in the vent composer, your dashboard, mood tracking, or any crisis or support messages.</p>
        <UL>
            <li>Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to this website or other websites.</li>
            <li>Google&apos;s use of advertising cookies enables it and its partners to serve ads to users based on their visits to this site and/or other sites on the Internet.</li>
            <li>Ads may be personalized (interest-based) or non-personalized, depending on your choices and the privacy laws where you live. In the European Economic Area, the United Kingdom, and Switzerland, you will be asked for consent before personalized ads are used.</li>
            <li>Advertising cookies are set and read by Google and its partners, not by Venting. We do not pass your vents, comments, mood data, or AI safety and moderation results to them.</li>
        </UL>
        <SubSection title="Your advertising choices">
            <UL>
                <li>Opt out of personalized advertising from Google in <ExternalLink href="https://adssettings.google.com">Google Ads Settings</ExternalLink>.</li>
                <li>Opt out of some third-party vendors&apos; use of cookies for personalized advertising at <ExternalLink href="https://www.aboutads.info/choices">www.aboutads.info</ExternalLink>.</li>
                <li>If you are in Europe, you can also use <ExternalLink href="https://www.youronlinechoices.eu">www.youronlinechoices.eu</ExternalLink>.</li>
            </UL>
            <p>Opting out stops personalized ads, but you may still see non-personalized ads.</p>
        </SubSection>
    </Section>

    <Section title="8. Service Providers">
        <p>We rely on these providers to run the platform. Each one processes data only to provide its service:</p>
        <UL>
            <li><strong>Google Firebase:</strong> authentication, database, file storage, and analytics.</li>
            <li><strong>Groq:</strong> AI model inference for safety moderation and reflection features.</li>
            <li><strong>Stripe:</strong> payment processing for optional donations. We do not store card details.</li>
            <li><strong>Google AdSense:</strong> advertising, where enabled.</li>
        </UL>
    </Section>

    <Section title="9. Data Storage & Security">
        <UL>
            <li>User data is securely stored using Firebase infrastructure.</li>
            <li>Database security rules ensure private data remains accessible only to authorized accounts.</li>
            <li>Data is encrypted in transit and at rest by our infrastructure provider.</li>
        </UL>
    </Section>

     <Section title="10. User Rights & Control">
        <p>Users have the right to:</p>
        <UL>
            <li>Edit or delete their content at any time</li>
            <li>Delete their account and associated data (see <Link href="/account-deletion" className="underline hover:text-foreground">Account Deletion</Link>)</li>
            <li>Control privacy and visibility settings</li>
            <li>Ask what personal data we hold about them, or ask us to correct it, by contacting us</li>
            <li>Manage cookies and advertising preferences as described in Sections 5 and 7</li>
        </UL>
    </Section>

    <Section title="11. Children’s Privacy">
        <p>The platform is not directed at children. You must be at least 13 years old to use it, or at least 16 in the European Economic Area (or the lower minimum age of digital consent set by your country, if one applies). We do not knowingly collect personal data from anyone below these ages. If you believe a child has provided us with personal data, contact us and we will delete it.</p>
    </Section>

    <Section title="12. Updates to Policy">
        <p>This policy may be updated to reflect new platform features, AI architecture enhancements, or legal requirements. Continued platform use constitutes acceptance of updated terms.</p>
    </Section>

    <Section title="13. Contact Us">
        <p>For privacy questions, data requests, or concerns, email <ContactEmail /> or visit our <Link href="/contact" className="underline hover:text-foreground">Contact page</Link>.</p>
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
        <li><strong>Serverless Isolation:</strong> All AI flows run exclusively inside stateless backend server actions.</li>
        <li><strong>Transient Processing:</strong> Text is sent to our AI provider only for the duration of the request that needs it.</li>
        <li><strong>No Separate AI Logs:</strong> Venting does not keep a separate store of AI inputs or use them as training data.</li>
        <li><strong>Automated Fallback Net:</strong> Pre-filtering ensures client operations complete reliably even during external network latencies.</li>
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
        We maintain full operational transparency regarding platform updates, AI pipeline enhancements, and release logs. You can inspect all release history on our official{" "}
        <Link href="/updates" className="underline hover:text-foreground">Update Log &amp; AI Transparency Hub</Link> page.
      </p>
    </Section>

    <div className="mt-8 pt-4 border-t border-white/10">
        <h3 className="font-bold text-center">Legal Notice</h3>
        <p className="text-center text-sm text-muted-foreground">For legal inquiries, compliance requests, or data protection questions, email <ContactEmail /> or use our <Link href="/contact" className="underline hover:text-foreground">Contact page</Link>.</p>
    </div>
  </>
);
