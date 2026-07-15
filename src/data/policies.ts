/**
 * Legal policy content sourced from https://svsfood.com/
 * Update via: node scripts/fetch-policies.mjs
 */
export type PolicySection = {
  heading: string | null;
  paragraphs: string[];
  bullets: string[];
};

export type PolicyPage = {
  slug: string;
  title: string;
  sections: PolicySection[];
};

export const policyPages: PolicyPage[] = [
  {
    "slug": "refund-policy",
    "title": "Refund Policy SVS FOOD",
    "sections": [
      {
        "heading": "Refund Policy SVS FOOD",
        "paragraphs": [],
        "bullets": []
      },
      {
        "heading": "SVS FOOD Orders: Refund Policy",
        "paragraphs": [
          "Please Note: This is valid only for SVS FOOD Orders."
        ],
        "bullets": []
      },
      {
        "heading": "Your Money is Secure",
        "paragraphs": [
          "If your amount has been deducted from UPI or Debit/Credit Card or Netbanking or Wallet, please do not worry, your money is safe as per Consumer Safeguarding Guidelines."
        ],
        "bullets": []
      },
      {
        "heading": "Cancellation Policy",
        "paragraphs": [
          "Thank you for choosing us! We're dedicated to providing you with exceptional service. Please review our cancellation policy below:",
          "Once orders are placed, they cannot be cancelled.",
          "We understand that situations may arise where you need to cancel an order. However, please note that once orders are placed, they cannot be cancelled. We start preparing your order as soon as your order is confirmed, and our delivery partners are promptly dispatched to ensure you receive your order on time.",
          "We encourage all customers to double-check their orders before finalizing them to ensure accuracy and satisfaction. If you have any concerns or questions, please contact our customer support team before placing your order. We're here to help and provide any necessary information to assist in your decision-making process.",
          "Exceptions may be considered in extraordinary circumstances, such as unavailability of ingredients or unforeseen emergencies. However, these exceptions will be assessed on a case-by-case basis and are not guaranteed. We appreciate your understanding and cooperation in adhering to our cancellation policy."
        ],
        "bullets": []
      },
      {
        "heading": "Important Points",
        "paragraphs": [
          "For further support and queries email us at helpdesk@svsfood.com, info@svsfood.com, career@svsfood.com"
        ],
        "bullets": [
          "It usually happens when bank servers are not able to confirm the payment status immediately.",
          "If the bank confirms the payment to our servers within the next 15 minutes, your order will be processed automatically.",
          "If the bank confirms the payment to our servers after 15 minutes, then our system will reject the order and initiate the refund automatically.",
          "After a refund is initiated, it takes 5–7 working days to get the amount back in your account."
        ]
      }
    ]
  },
  {
    "slug": "privacy-policy",
    "title": "Privacy Policy SVS FOOD",
    "sections": [
      {
        "heading": "Privacy Policy SVS FOOD",
        "paragraphs": [
          "The terms We / Us / Our / Company individually and collectively refer to SVS FOOD, and the terms You / Your / Yourself refer to the users. This Privacy Policy is an electronic record in the form of an electronic contract formed under the Information Technology Act, 2000 and the rules made thereunder and the amended provisions pertaining to electronic documents / records in various statutes as amended by the Information Technology Act, 2000. This Privacy Policy does not require any physical, electronic or digital signature.",
          "This Privacy Policy is a legally binding document between you and SVS FOOD (both terms defined below). The terms of this Privacy Policy will be effective upon your acceptance of the same (directly or indirectly in electronic form, by clicking on the I accept tab or by use of the website or by other means) and will govern the relationship between you and SVS FOOD for your use of the Website (defined below). This document is published and shall be construed in accordance with the provisions of the Information Technology (reasonable security practices and procedures and sensitive personal data of information) rules, 2011 under Information Technology Act, 2000; that require publishing of the Privacy Policy for collection, use, storage and transfer of sensitive personal data or information.",
          "Please read this Privacy Policy carefully. By using the Website, you indicate that you understand, agree and consent to this Privacy Policy. If you do not agree with the terms of this Privacy Policy, please do not use this Website.",
          "By providing us your Information or by making use of the facilities provided by the Website, You hereby consent to the collection, storage, processing and transfer of any or all of Your Personal Information and Non-Personal Information by us as specified under this Privacy Policy. You further agree that such collection, use, storage and transfer of Your Information shall not cause any loss or wrongful gain to you or any other person."
        ],
        "bullets": []
      },
      {
        "heading": "User Information",
        "paragraphs": [
          "To avail certain services on our Websites, users are required to provide certain information for the registration process namely: a) your name, b) email address, c) sex, d) age, e) PIN code, f) credit card or debit card details, g) medical records and history, h) sexual orientation, i) biometric information, j) password etc., and/or your occupation, interests, and the like. The Information as supplied by the users enables us to improve our sites and provide you the most user-friendly experience.",
          "All required information is service dependent and we may use the above said user information to maintain, protect, and improve its services (including advertising services) and for developing new services.",
          "Such information will not be considered as sensitive if it is freely available and accessible in the public domain or is furnished under the Right to Information Act, 2005 or any other law for the time being in force.",
          "This Privacy Policy outlines our commitment to safeguarding the privacy and security of your personal information when you use our services. It also addresses specific requirements outlined by Google Play Store regarding the collection and usage of users' Phone Number information."
        ],
        "bullets": []
      },
      {
        "heading": "Collection of Phone Number Information",
        "paragraphs": [
          "Our app may collect and store your Phone Number information for specific purposes. We recognize the importance of transparency and have structured our data collection practices to align with the following principles:",
          "1. Disclosure of Collection: We are committed to clarity and transparency. Our Privacy Policy aims to inform you that your Phone Number information may be collected during the use of our app.",
          "2. Usage of Collected Phone Number: We consider it our responsibility to ensure that the collected Phone Number information is used solely for the intended purposes as described in our app's functionality and features."
        ],
        "bullets": []
      },
      {
        "heading": "Intended Usage",
        "paragraphs": [
          "The Phone Number information is collected for the following purposes:",
          "1. Phone number information is collected to verify your account. 2. To communicate the current status of the orders placed through our app."
        ],
        "bullets": []
      },
      {
        "heading": "Data Security and Protection",
        "paragraphs": [
          "We understand the importance of securing your personal information. Therefore, we have implemented appropriate security measures to safeguard your Phone Number information against unauthorized access, disclosure, alteration, or destruction."
        ],
        "bullets": []
      },
      {
        "heading": "Your Consent",
        "paragraphs": [
          "By using our app, you consent to the collection and usage of your Phone Number information as outlined in this Privacy Policy. You have the option to withhold your consent by refraining from providing your Phone Number information."
        ],
        "bullets": []
      },
      {
        "heading": "Updates to Privacy Policy",
        "paragraphs": [
          "We may update this Privacy Policy to reflect changes in our data collection practices, legal requirements, or improvements in our services. Any modifications will be communicated to you through our app or website.",
          "We want to provide you with a comprehensive understanding of how your phone number is handled within our system:",
          "Your phone number is collected as part of our registration and user account verification process. It is stored in a safe and secure manner on our dedicated servers hosted at api.uengage.in . We have implemented stringent security measures and protocols to protect your phone number from unauthorized access, disclosure, alteration, or any form of misuse.",
          "Your privacy and data security are paramount. We are committed to maintaining the confidentiality of your personal information, including your phone number, and ensuring that it is used exclusively for legitimate and essential app functions, such as user account verification or communication."
        ],
        "bullets": []
      },
      {
        "heading": "Cookies",
        "paragraphs": [
          "To improve the responsiveness of the sites for our users, we may use cookies, or similar electronic tools to collect information to assign each visitor a unique, random number as a User Identification (User ID) to understand the user's individual interests using the Identified Computer. Unless you voluntarily identify yourself (through registration, for example), we will have no way of knowing who you are, even if we assign a cookie to your computer. The only personal information a cookie can contain is information you supply. A cookie cannot read data off your hard drive. Our advertisers may also assign their own cookies to your browser (if you click on their ads), a process that we do not control.",
          "Our web servers automatically collect limited information about your computer's connection to the Internet, including your IP address, when you visit our site. (Your IP address is a number that lets computers attached to the Internet know where to send you data, such as the web pages you view.) Your IP address does not identify you personally. We use this information to deliver our web pages to you upon request, to tailor our site to the interests of our users, to measure traffic within our site and let advertisers know the geographic locations from where our visitors come."
        ],
        "bullets": []
      },
      {
        "heading": "Links to Other Sites",
        "paragraphs": [
          "Our policy discloses the privacy practices for our own web site only. Our site provides links to other websites also that are beyond our control. We shall in no way be responsible for your use of such sites."
        ],
        "bullets": []
      },
      {
        "heading": "Information Sharing",
        "paragraphs": [
          "We share the sensitive personal information to any third party without obtaining the prior consent of the user in the following limited circumstances:",
          "(a) When it is requested or required by law or by any court or governmental agency or authority to disclose, for the purpose of verification of identity, or for the prevention, detection, investigation including cyber incidents, or for prosecution and punishment of offences. These disclosures are made in good faith and belief that such disclosure is reasonably necessary for enforcing these Terms; for complying with the applicable laws and regulations.",
          "(b) We propose to share such information within its group companies and officers and employees of such group companies for the purpose of processing personal information on its behalf. We also ensure that these recipients of such information agree to process such information based on our instructions and in compliance with this Privacy Policy and any other appropriate confidentiality and security measures."
        ],
        "bullets": []
      },
      {
        "heading": "Information Security",
        "paragraphs": [
          "We take appropriate security measures to protect against unauthorized access to or unauthorized alteration, disclosure or destruction of data. These include internal reviews of our data collection, storage and processing practices and security measures, including appropriate encryption and physical security measures to guard against unauthorized access to systems where we store personal data.",
          "All information gathered on our Website is securely stored within our controlled database. The database is stored on servers secured behind a firewall; access to the servers is password-protected and is strictly limited. However, as effective as our security measures are, no security system is impenetrable. We cannot guarantee the security of our database, nor can we guarantee that information you supply will not be intercepted while being transmitted to us over the Internet. And, of course, any information you include in a posting to the discussion areas is available to anyone with Internet access.",
          "However the internet is an ever evolving medium. We may change our Privacy Policy from time to time to incorporate necessary future changes. Of course, our use of any information we gather will always be consistent with the policy under which the information was collected, regardless of what the new policy may be."
        ],
        "bullets": []
      },
      {
        "heading": "Grievance Redressal",
        "paragraphs": [
          "Redressal Mechanism: Any complaints, abuse or concerns with regards to content and or comment or breach of these terms shall be immediately informed to the designated Grievance Officer as mentioned below, in writing or through email signed with the electronic signature to the Grievance Officer.",
          "Brand Name: SVS FOOD Website: svsfood.com Grievance Officer EmailId: helpdesk@svsfood.com, info@svsfood.com, career@svsfood.com Contact No.: 7869717041"
        ],
        "bullets": []
      }
    ]
  },
  {
    "slug": "terms-and-conditions",
    "title": "TERMS AND CONDITIONS",
    "sections": [
      {
        "heading": "Order Complaints & Returns",
        "paragraphs": [
          "No returns = No refund/replacement."
        ],
        "bullets": [
          "You must raise any issue regarding your order within 15 minutes of receiving it.",
          "In case of any problem with the food, you must return the product to claim a replacement or refund."
        ]
      },
      {
        "heading": "Use of Website",
        "paragraphs": [],
        "bullets": [
          "You agree to use this website legally and respectfully.",
          "You must not upload or share anything abusive, illegal, or harmful.",
          "Hacking or tampering with the website's security is strictly prohibited."
        ]
      },
      {
        "heading": "Copyright & Content",
        "paragraphs": [],
        "bullets": [
          "All logos, names, and content belong to the company or its partners.",
          "You can't copy, modify, or use them for commercial purposes without permission."
        ]
      },
      {
        "heading": "Liability",
        "paragraphs": [
          "We are not liable for losses or damages caused due to:"
        ],
        "bullets": [
          "Service interruptions",
          "Website errors or downtime",
          "Actions of third-party services or users"
        ]
      },
      {
        "heading": "Indemnity",
        "paragraphs": [
          "By using our website, you agree to hold us harmless from any legal claims or issues arising from your actions on the site."
        ],
        "bullets": []
      },
      {
        "heading": "Disclaimer",
        "paragraphs": [
          "We are not responsible for any indirect losses (like data loss, profit loss, or system damage) due to use of this website."
        ],
        "bullets": []
      }
    ]
  },
  {
    "slug": "shipping-policy",
    "title": "Shipping Policy for SVS FOOD",
    "sections": [
      {
        "heading": "Shipping Policy for SVS FOOD",
        "paragraphs": [],
        "bullets": []
      },
      {
        "heading": "Overview",
        "paragraphs": [
          "This shipping policy outlines the terms and conditions related to the physical delivery of items ordered from the Order Processing Time to Delivery.",
          "All the orders are processed within the time mentioned while placing the order after receiving your order confirmation and successful completion of payment.",
          "You will receive a notification when your order is shipped."
        ],
        "bullets": []
      },
      {
        "heading": "Eligibility",
        "paragraphs": [
          "This shipping policy applies to specific products that are eligible for physical delivery. Eligibility criteria or restrictions will be clearly communicated."
        ],
        "bullets": []
      },
      {
        "heading": "Shipping Regions",
        "paragraphs": [
          "This shipping policy is applicable for all SVS FOOD Outlets across India."
        ],
        "bullets": []
      },
      {
        "heading": "Delivery Timeframes",
        "paragraphs": [
          "Delivery time taken is about 35–45 minutes after the food is ordered.",
          "Estimated time and actual delivery time may vary, depending on circumstances and unforeseen reasons.",
          "There might be potential delays due to high volume of orders or postal service problems that are outside of our control.",
          "Tracking information is available from the time of delivery is picked up and delivered to the customer."
        ],
        "bullets": []
      },
      {
        "heading": "Shipping Cost",
        "paragraphs": [
          "Shipping charges for your order will be calculated and displayed at checkout. Any associated shipping fees charged by the partner app will be displayed at checkout."
        ],
        "bullets": []
      },
      {
        "heading": "Delivery Partners",
        "paragraphs": [
          "If you order through delivery partners or carriers, the shipping policy of the delivery partners/carriers is applicable."
        ],
        "bullets": []
      },
      {
        "heading": "Order Confirmation",
        "paragraphs": [
          "Order is confirmed only on successful completion of payment with relevant shipping details. A confirmation message is sent to the customer on successful order.",
          "It is important for the customer to mention their accurate and up-to-date address information along with the nearest landmark.",
          "If the address is not provided correctly, the order stands cancelled."
        ],
        "bullets": []
      },
      {
        "heading": "Returns & Refunds",
        "paragraphs": [
          "In the event if the products delivered are damaged during shipping, a process of returns and refunds are outlined. A separate policy is defined and associated fees or conditions will be communicated."
        ],
        "bullets": []
      },
      {
        "heading": "Customer Support",
        "paragraphs": [
          "Customers can contact our dedicated customer support for any shipping related enquiries as applicable at the mentioned contact details as part of order tracking system."
        ],
        "bullets": []
      },
      {
        "heading": "Changes to the Policy",
        "paragraphs": [
          "This shipping policy may be subject to change. Customers will be notified of any updates and the latest version will be made available on our website from time to time."
        ],
        "bullets": []
      }
    ]
  }
];

export const policyBySlug = Object.fromEntries(
  policyPages.map((page) => [page.slug, page]),
) as Record<string, PolicyPage>;
