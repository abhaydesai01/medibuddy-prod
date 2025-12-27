import React, { useState, useRef, useEffect } from "react";
import { X, FileText, CheckCircle } from "lucide-react";

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({
  isOpen,
  onAccept,
  onDecline,
}) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(false);
      setIsChecked(false);
    }
  }, [isOpen]);

  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 20) {
        setHasScrolledToBottom(true);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">Terms & Conditions</h2>
          </div>
          <button
            onClick={onDecline}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 py-4 text-sm text-gray-700 leading-relaxed"
        >
          <TermsContent />
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-gray-50">
          {!hasScrolledToBottom && (
            <p className="text-xs text-amber-600 mb-3 text-center">
              Please scroll to the bottom to read all terms before accepting.
            </p>
          )}
          
          <label className="flex items-start gap-3 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              disabled={!hasScrolledToBottom}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
            />
            <span className={`text-sm ${!hasScrolledToBottom ? "text-gray-400" : "text-gray-700"}`}>
              I have read and agree to the Terms & Conditions and Privacy Policy of Mediimate.
            </span>
          </label>

          <div className="flex gap-3">
            <button
              onClick={onDecline}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={onAccept}
              disabled={!isChecked}
              className="flex-1 px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-5 w-5" />
              Accept & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TermsContent: React.FC = () => (
  <div className="space-y-6">
    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-3">1. GENERAL TERMS OF USE</h3>
      <p className="mb-3">
        <strong>1.1</strong> Welcome to Mediimate. These Terms & Conditions of Use (hereinafter referred to as the "Terms" or "Agreement") constitute a valid, binding, and enforceable legal contract between you, being the individual or legal entity accessing or using the Platform (hereinafter referred to as the "User", "you", or "your"), and Jivayoi Wellness and Living Private Limited, a company incorporated under the laws of India, which owns, operates, and manages the Mediimate platform (hereinafter referred to as "Mediimate", "Company", "we", "us", or "our").
      </p>
      <p className="mb-3">
        This Agreement governs your access to, interaction with, and use of the Mediimate website, mobile application, and all associated digital platforms, tools, features, services, and content made available by Mediimate (collectively, the "Platform").
      </p>
      <p className="mb-3">
        <strong>1.2</strong> For the purposes of these Terms:
      </p>
      <ul className="list-disc pl-6 mb-3 space-y-1">
        <li>References to "we", "us", or "our" shall be construed as references to Jivayoi Wellness and Living Private Limited, operating under the brand name Mediimate.</li>
        <li>References to "you", "your", or "User" shall mean any natural person, legal person, organization, healthcare professional, institution, or other entity who accesses, browses, registers on, or otherwise uses the Platform, whether directly or indirectly.</li>
        <li>References to the "Platform" shall include the Mediimate website, mobile application, software systems, dashboards, APIs, content, features, tools, and services, whether existing now or introduced in the future.</li>
      </ul>
      <p className="mb-3">
        <strong>1.3</strong> The Platform, together with all products, features, tools, content, and services made available through Mediimate, is provided subject to strict compliance with these Terms, the Privacy Policy, and all applicable laws, rules, and regulations in force in India.
      </p>
      <p className="mb-3">
        <strong>1.4</strong> These Terms shall be read in conjunction with Mediimate's Privacy Policy, which governs the collection, processing, storage, use, and protection of personal and sensitive personal data. The Privacy Policy forms an integral and inseparable part of this Agreement.
      </p>
      <p className="mb-3">
        <strong>1.5</strong> By accessing, browsing, registering on, downloading, installing, or using any part of the Platform, you expressly acknowledge, confirm, and agree that:
      </p>
      <ul className="list-disc pl-6 mb-3 space-y-1">
        <li>You have read and understood these Terms and the Privacy Policy;</li>
        <li>You are legally competent to enter into a binding contract under applicable law;</li>
        <li>Your access to and use of the Platform constitutes your unconditional acceptance of these Terms and the Privacy Policy; and</li>
        <li>This Agreement creates legally binding obligations upon you.</li>
      </ul>
      <p className="mb-3">
        <strong>1.6</strong> Mediimate reserves the right, at its sole and absolute discretion, to revise, amend, modify, update, or replace these Terms, in whole or in part, at any time, with or without prior notice to you.
      </p>
      <p className="mb-3">
        <strong>1.7</strong> You expressly acknowledge and agree that your use of the Platform signifies your free, informed, and voluntary consent to be bound by the terms and conditions set forth in this Agreement.
      </p>
      <p className="mb-3 font-semibold text-red-600">
        IF YOU DO NOT AGREE TO THESE TERMS, YOU MUST IMMEDIATELY DISCONTINUE ACCESSING OR USING THE PLATFORM.
      </p>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-3">2. USE OF CONTENT AND SERVICES</h3>
      <p className="mb-3">
        <strong>2.1</strong> The User is permitted to access and use the Platform strictly for the limited and lawful purposes for which the Platform is made available, including but not limited to the secure storage, access, organization, and management of medical records, facilitation of healthcare consultations, retrieval and sharing of health-related information, and such other healthcare support services as may be offered by Mediimate from time to time.
      </p>
      <p className="mb-3">
        <strong>2.2</strong> The information, materials, content, and services provided or made available on or through the Platform are offered in connection with Mediimate's business and service offerings and are intended solely for use in furtherance of the purposes of the Platform.
      </p>
      <p className="mb-3">
        <strong>2.3</strong> The User undertakes and agrees to access and use the Platform and its content exclusively for the purposes expressly permitted under these Terms and shall not access, reproduce, distribute, disclose, or otherwise use any content, data, or information obtained through the Platform for the benefit of any third party.
      </p>
      <p className="mb-3">
        <strong>2.4</strong> All copyrights, trademarks, service marks, trade names, logos, designs, software, text, images, graphics, audio, video, and other proprietary materials made available on or through the Platform are owned by or licensed to Mediimate and are protected by applicable intellectual property laws.
      </p>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-3">3. USE OF THE PLATFORM</h3>
      <p className="mb-3">
        <strong>3.1</strong> Access to and use of the Platform is granted at the sole discretion of Mediimate. Mediimate reserves the absolute right, without obligation to assign any reason, to allow, restrict, suspend, or terminate the User's access to the Platform, in whole or in part, at any time, with or without notice.
      </p>
      <p className="mb-3">
        <strong>3.2</strong> The User agrees that all access to and use of the Platform shall be in strict compliance with these Terms and all applicable laws, rules, and regulations in force in India. The User expressly undertakes that they shall not:
      </p>
      <ul className="list-disc pl-6 mb-3 space-y-1">
        <li>Impersonate any person or entity, or falsely state or otherwise misrepresent the User's affiliation;</li>
        <li>Interfere with, disrupt, or attempt to interfere with the operation, integrity, or security of the Platform;</li>
        <li>Circumvent, attempt to circumvent, or breach any security, authentication, or access-control mechanisms;</li>
        <li>Upload, post, transmit, or otherwise make available any content that is false, misleading, unlawful, harmful, threatening, abusive, harassing, defamatory, obscene, or otherwise objectionable;</li>
        <li>Upload any material that contains software viruses, malware, or any other computer code designed to interrupt, destroy, or limit the functionality of any software or hardware.</li>
      </ul>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-3">4. USER SUBMISSIONS</h3>
      <p className="mb-3">
        <strong>4.1</strong> Any and all information, data, medical records, documents, images, communications, or other materials voluntarily submitted, uploaded, posted, shared, transmitted, or otherwise made available by the User on or through the Platform shall be deemed to have been provided at the User's sole discretion, responsibility, and risk.
      </p>
      <p className="mb-3">
        <strong>4.2</strong> The User expressly acknowledges and agrees that Mediimate does not verify, validate, authenticate, or otherwise confirm the accuracy, completeness, legality, or medical correctness of any Submissions.
      </p>
      <p className="mb-3">
        <strong>4.3</strong> By submitting such Submissions, the User grants Mediimate a worldwide, non-exclusive, royalty-free, transferable, and sublicensable license to store, host, process, reproduce, use, modify, adapt, display, and transmit such Submissions solely for the purposes of providing, operating, improving, and administering the Platform.
      </p>
      <p className="mb-3">
        <strong>4.4</strong> The User expressly consents to Mediimate using Submissions in an anonymized, aggregated, or de-identified form for purposes including analytics, research, platform optimization, and the development of artificial intelligence or machine-learning algorithms.
      </p>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-3">5. LINKS TO OTHER WEBSITES</h3>
      <p className="mb-3">
        <strong>5.1</strong> The Platform may contain links, references, or access points to websites, applications, or digital platforms operated by third parties that are not owned, controlled, or managed by Mediimate. Such links are provided solely for the convenience of the User and do not constitute any endorsement, sponsorship, recommendation, or approval by Mediimate.
      </p>
      <p className="mb-3">
        <strong>5.2</strong> Mediimate does not exercise any control over, and expressly disclaims any responsibility or liability for, the accuracy, completeness, legality, availability, or content of any Third-Party Websites.
      </p>
      <p className="mb-3">
        <strong>5.3</strong> Access to and use of any Third-Party Websites shall be at the User's sole risk.
      </p>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-3">6. PRIVACY AND DATA SECURITY</h3>
      <p className="mb-3">
        <strong>6.1</strong> Mediimate considers the User's access to and use of the Platform to be private and confidential in nature. However, the User expressly acknowledges and agrees that Mediimate may access, monitor, preserve, or disclose information relating to the User where such access or disclosure is reasonably necessary to:
      </p>
      <ul className="list-disc pl-6 mb-3 space-y-1">
        <li>Comply with applicable laws, rules, regulations, legal processes, court orders, subpoenas, notices, or governmental requests;</li>
        <li>Enforce these Terms or the Privacy Policy;</li>
        <li>Protect and defend the rights, property, or safety of Mediimate, its directors, officers, employees, agents, affiliates, Users, healthcare professionals, or the public at large.</li>
      </ul>
      <p className="mb-3">
        <strong>6.2</strong> Mediimate employs reasonable and appropriate technical, administrative, and organizational safeguards designed to protect the security, integrity, and confidentiality of communications, data transmissions, and information exchanged through the Platform.
      </p>
      <p className="mb-3">
        <strong>6.3</strong> The User acknowledges that no method of transmission over the internet or method of electronic storage is completely secure, and Mediimate does not warrant or guarantee the absolute security of any data transmitted through the Platform.
      </p>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-3">7. DISCLAIMER OF WARRANTIES</h3>
      <p className="mb-3">
        <strong>7.1</strong> The User expressly understands, acknowledges, and agrees that access to and use of the Platform is at the User's sole risk. The Platform, including all content, information, software, tools, features, and services made available thereon, is provided on an "AS IS" and "AS AVAILABLE" basis.
      </p>
      <p className="mb-3">
        <strong>7.2</strong> To the fullest extent permitted under applicable law, Mediimate expressly disclaims any and all warranties, whether express, implied, statutory, or otherwise, including but not limited to implied warranties of merchantability, fitness for a particular purpose, non-infringement, accuracy, completeness, reliability, quality, performance, availability, or non-interference.
      </p>
      <p className="mb-3">
        <strong>7.3</strong> Any material downloaded, accessed, or otherwise obtained through the use of the Platform is done at the User's own discretion and risk.
      </p>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-3">8. LIMITATION AND EXCLUSION OF LIABILITY</h3>
      <p className="mb-3">
        <strong>8.1</strong> To the maximum extent permitted under applicable law, neither Mediimate nor its directors, officers, employees, agents, affiliates, service providers, or licensors shall be liable for any direct, indirect, incidental, special, consequential, punitive, or exemplary damages whatsoever.
      </p>
      <p className="mb-3">
        <strong>8.2</strong> If the User is dissatisfied with the Platform, any services offered thereon, or any of the information or content made available through the Platform, the User's sole and exclusive remedy shall be to discontinue access to and use of the Platform.
      </p>
      <p className="mb-3">
        <strong>8.3</strong> The aggregate liability of Mediimate to the User for any and all claims arising out of or relating to the use of the Platform shall be limited to the total amount of fees, if any, actually paid by the User to Mediimate.
      </p>
      <p className="mb-3">
        <strong>8.4</strong> The User expressly agrees that they shall not initiate, participate in, or be a member of any class action, collective action, representative action, or consolidated proceeding against Mediimate.
      </p>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-3">9. INTELLECTUAL PROPERTY RIGHTS</h3>
      <p className="mb-3">
        <strong>9.1</strong> The Platform, including but not limited to the website, mobile application, software, source code, object code, databases, text, graphics, images, illustrations, audio, video, design elements, user interfaces, layout, compilation, and all other content and materials made available on or through the Platform, is protected by applicable copyright, trademark, trade dress, and other intellectual property laws.
      </p>
      <p className="mb-3">
        <strong>9.2</strong> Subject to the User's compliance with these Terms, Mediimate grants the User a limited, personal, revocable, non-exclusive, non-transferable, and non-sublicensable license to access and use the Platform solely for the User's personal, non-commercial use.
      </p>
      <p className="mb-3">
        <strong>9.3</strong> All trademarks, service marks, trade names, logos, product names, service names, and other brand identifiers displayed on the Platform are the exclusive property of Mediimate or its affiliates or licensors.
      </p>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-3">10. INDEMNIFICATION</h3>
      <p className="mb-3">
        <strong>10.1</strong> The User agrees to defend, indemnify, and hold harmless Jivayoi Wellness and Living Private Limited, operating under the brand name Mediimate, and its directors, officers, employees, agents, affiliates, service providers, and licensors from and against any and all claims, demands, actions, proceedings, liabilities, losses, damages, costs, and expenses arising out of or in connection with:
      </p>
      <ul className="list-disc pl-6 mb-3 space-y-1">
        <li>The User's access to, use of, or inability to use the Platform;</li>
        <li>Any breach or alleged breach by the User of these Terms, the Privacy Policy, or any applicable law;</li>
        <li>Any Submissions, data, medical records, content, or information submitted by the User through the Platform;</li>
        <li>Any violation by the User of the rights of any third party;</li>
        <li>Any misuse of the Platform or services in a manner not expressly permitted under these Terms.</li>
      </ul>
      <p className="mb-3">
        <strong>10.2</strong> This indemnification obligation shall survive the termination or expiration of the User's access to the Platform or this Agreement.
      </p>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-3">11. MODIFICATION</h3>
      <p className="mb-3">
        <strong>11.1</strong> Mediimate reserves the right, at its sole and absolute discretion, to update, revise, supplement, modify, amend, or otherwise change these Terms, in whole or in part, at any time and from time to time.
      </p>
      <p className="mb-3">
        <strong>11.2</strong> The User expressly acknowledges and agrees that they shall be bound by these Terms, as updated, revised, supplemented, modified, or amended, regardless of whether the User has received actual notice of such changes.
      </p>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-3">12. ENTIRE AGREEMENT</h3>
      <p className="mb-3">
        <strong>12.1</strong> These Terms, together with the Privacy Policy and any other policies, guidelines, or notices expressly incorporated herein by reference, constitute the entire agreement between the User and Mediimate with respect to the User's access to and use of the Platform.
      </p>
      <p className="mb-3">
        <strong>12.2</strong> This Agreement supersedes and replaces any and all prior or contemporaneous agreements, understandings, representations, warranties, communications, or arrangements, whether written or oral, between the User and Mediimate relating to the subject matter hereof.
      </p>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-3">13. SEVERABILITY</h3>
      <p className="mb-3">
        <strong>13.1</strong> If any provision, clause, or part of these Terms is held or determined by any court of competent jurisdiction or other competent authority to be unlawful, invalid, void, voidable, or unenforceable for any reason whatsoever, such provision shall be deemed to be severed from these Terms.
      </p>
      <p className="mb-3">
        <strong>13.2</strong> The severance of any such provision shall not affect the legality, validity, or enforceability of the remaining provisions of these Terms.
      </p>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-3">14. GOVERNING LAW AND JURISDICTION</h3>
      <p className="mb-3">
        <strong>14.1</strong> These Terms, this Agreement, and any dispute, claim, controversy, or difference arising out of or in connection with these Terms, the Platform, or the services provided by Mediimate shall be governed by and construed in accordance with the laws of India, without regard to any principles of conflict of laws.
      </p>
      <p className="mb-3">
        <strong>14.2</strong> The User hereby expressly agrees and consents that the courts of competent jurisdiction in India shall have exclusive jurisdiction to adjudicate and resolve any disputes arising out of or in connection with these Terms.
      </p>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-3">15. TERMINATION</h3>
      <p className="mb-3">
        <strong>15.1</strong> Mediimate reserves the right, at its sole and absolute discretion, to suspend, restrict, or terminate the User's access to and use of the Platform, in whole or in part, at any time, with or without prior notice, and with or without cause.
      </p>
      <p className="mb-3">
        <strong>15.2</strong> Upon termination of the User's access for any reason whatsoever, the User's right to access and use the Platform shall immediately cease. All provisions of these Terms which by their nature or intent are intended to survive termination shall survive and remain in full force and effect.
      </p>
      <p className="mb-3">
        <strong>15.3</strong> Termination of access to the Platform shall be without prejudice to any rights, remedies, or claims that Mediimate may have against the User under these Terms, applicable law, or otherwise.
      </p>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-3">16. CONTACT INFORMATION</h3>
      <p className="mb-3">
        <strong>16.1</strong> If the User has any questions, comments, concerns, requests, or grievances relating to these Terms, the Privacy Policy, the Platform, or the services provided by Mediimate, the User may contact Mediimate through the details provided below.
      </p>
      <p className="mb-3">
        <strong>16.2</strong> All communications, notices, or legal correspondence intended for Mediimate shall be addressed as follows:
      </p>
      <p className="mb-3 pl-4">
        <strong>Email:</strong> support@mediimate.com<br />
        <strong>Registered / Corporate Office:</strong> 8 JP Nagar 9th phase 3rd block, 8th phase, Bengaluru-560076
      </p>
      <p className="mb-3">
        <strong>16.3</strong> Mediimate shall use reasonable efforts to respond to User communications within a reasonable timeframe.
      </p>
    </section>

    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-3">17. LEGAL ENTITY REPRESENTATION AND OWNERSHIP</h3>
      <p className="mb-3">
        <strong>17.1</strong> Mediimate is a brand name, platform, and product owned, operated, and managed by Jivayoi Wellness and Living Private Limited, a company incorporated under the laws of India. All references to "Mediimate", "we", "us", or "our" in these Terms, the Privacy Policy, or any other related documentation shall be deemed to refer to Jivayoi Wellness and Living Private Limited.
      </p>
      <p className="mb-3">
        <strong>17.2</strong> All rights, obligations, liabilities, and responsibilities arising under or in connection with these Terms shall accrue to and be enforceable by or against Jivayoi Wellness and Living Private Limited, notwithstanding the use of the brand name Mediimate.
      </p>
      <p className="mb-3">
        <strong>17.3</strong> These Terms, the Platform, and all related documentation are the exclusive intellectual property of Jivayoi Wellness and Living Private Limited. No part of these Terms or the Platform may be reproduced, copied, distributed, altered, published, or otherwise used without the prior written consent of Jivayoi Wellness and Living Private Limited.
      </p>
      <p className="mb-3">
        <strong>17.4</strong> Nothing contained in these Terms shall be construed as granting, by implication, estoppel, or otherwise, any license or right to use Mediimate's name, trademarks, logos, or other proprietary identifiers, except as expressly permitted herein.
      </p>
    </section>

    <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <p className="text-center text-sm text-blue-800 font-medium">
        By clicking "Accept & Continue", you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.
      </p>
    </div>
  </div>
);

export default TermsAndConditionsModal;
