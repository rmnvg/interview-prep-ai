
// interface GeminiResponse {
//     candidates: Array<{
//       content: {
//         parts: Array<{
//           text: string;
//         }>;
//       };
//     }>;
//   }
  
//   interface AIResponse {
//     questions: { question: string }[];
//   }
  
//   async function getGeminiQuestions(
//     Jd: string,
//     resume: string
//   ): Promise<{ questions: string[] }> {
//     const model = "gemini-2.0-flash";
//     const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=AIzaSyDoLCgKy2fjjs3f3aZNTkfSiQ6Ap8PibWM`;
  
//     const prompt = `Job Description: ${Jd}
//     Candidate Resume: ${resume}
//     Generate 3 targeted interview questions based on the following criteria:
//     - Questions should directly relate to the specific skills, technologies, and responsibilities mentioned in the job description
//     - Questions should be tailored to the candidate's existing experience and background as shown in their resume
//     - Questions should assess both technical competence and practical application of skills
//     - Difficulty level should match the seniority level indicated in both the job description and resume
  
//   Format your response as a JSON object with the following structure:
//   {
//     "questions": [
//       {
//         "question": "Complete question text here"
//       },
//       // 2 more questions following the same structure
//     ]
//   }
//   `;
  
//     const requestBody = {
//       contents: [
//         {
//           parts: [
//             {
//               text: prompt,
//             },
//           ],
//         },
//       ],
//     };
  
//     try {
//       const response = await fetch(url, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(requestBody),
//       });
  
//       if (!response.ok) {
//         let errorMessage = `HTTP error! status: ${response.status}`;
//         try {
//           const errorData = await response.json();
//           if (errorData.error && errorData.error.message) {
//             errorMessage += `: ${errorData.error.message}`;
//           }
//         } catch (parseError) {
//           console.error("Error parsing error response", parseError);
//         }
//         throw new Error(errorMessage);
//       }
  
//       const data: GeminiResponse = await response.json();
//       const responseText = data.candidates[0].content.parts[0].text;
  
//       const parsedResult: AIResponse = cleanJsonResponse(responseText);
//       console.log(parsedResult);
  
//       const qns = parsedResult.questions.map((item) => item.question);
//       // const qns = parsedResult ? parsedResult.questions : [];
  
//       return { questions: qns };
//     } catch (error) {
//       console.error("Error fetching Gemini feedback:", error);
//       return {
//         questions: [],
//       };
//     }
//   }
  
//   const cleanJsonResponse = (responseText: string) => {
//     let cleanText = responseText.trim();
//     cleanText = cleanText.replace(/(json|```|`)/g, "");
//     try {
//       return JSON.parse(cleanText);
//     } catch (error) {
//       throw new Error("Invalid JSON format: " + (error as Error)?.message);
//     }
//   };














//   const [questions, setQuestions] = useState<string[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);

//   useEffect(() => {
//     // Example job description and resume
//     const jobDescription = ` Software Engineers play a key role in the design, development/configuration, unit testing, installation, and ongoing maintenance of the company's software platforms. Senior Software Engineers work with stakeholders to develop solutions and/or products that fulfil the needs of internal stakeholders and clients. Those solutions and/or products help the company and our clients to be more efficient and provide better service to end customers. Senior Software Engineers interact directly with Technical leaders, business stakeholders, and may periodically interact directly with clients

// Work as part of a global, cross-functional team to develop innovative software for our stakeholders.
// Contribute to projects by creating well-designed, customized, testable, efficient code for our platforms.
// Assist our teams in providing ongoing support, troubleshooting, improvements, or custom enhancements to existing platforms.
// Flexibility to support the challenging development and delivery needs of the business
// Collaborate with our global teams, internal stakeholders, and customers.
// Act as a mentor and technology expert for team members and conduct technical reviews.
// Architect, Design, develop and validate various requirements for our platforms
// Ability to work in a fast-paced environment, recognize and react to changing business needs and effectively prioritize tasks
// Must be self-motivated and able to work both independently and in conjunction with team members and business units. Enthusiasm and flexibility to work on a variety of projects
 

// 6 to 9 years of experience in Backend technologies like C# and VB.Net
// Patience and perseverance to overcome challenges, solve problems, and learn new computer languages and techniques.
// Industry exposure to BFSI domain especially Insurance.
// Excellent work ethic. Ability to work and travel independently.
// Effective communication, interpersonal, and critical thinking skills. Effective troubleshooting skills.
// Ability to work as part of a cross-functional, global team.
// BTech / BE / MCA / MTech / ME or equivalent qualification from reputed institutes.`;
//     const resume = `SDE-2 07/2023 - Present
// G-P/Globalization Partners Bangalore
// Single-handedly engineered end-to-end API solutions, from design to production
// effectively overseeing a substantial daily request load of 250 interactions
// Integrated an SQS-based recovery pipeline, significantly reducing failure rates by
// 90% through effective retry mechanisms for failed transactions.
// Designed and implemented New Relic dashboards to capture metrics for all AWS
// resources, establishing alarms with defined thresholds for proactive monitoring and
// alerting
// Implemented Step Function workflow integrating four Lambda functions with SQS
// and DLQ along with retry policies for handling 5xx errors and timeouts
// Playing a key role in the migration effort from legacy to modern systems by crafting
// SQL scripts to flag records as 'dirty', facilitating event triggering via a cron job, and
// orchestrating event propagation through SQS queues and an event bus mechanism.
// Developed a comprehensive test strategy document encompassing identification of
// manual smoke testing, contract tests via pactflow ensuring thorough coverage
// across all potential use cases.
// Member of Technical Staff 04/2023 - 06/2023
// Stealth Startup ( Andromeda Security ) Bangalore
// Wrote a python script that would parse the cloud trail logs and establish graph
// connections between different IAM users and the kind of resources they are using
// which will help us in identifying the extent of privilege that should be given to any
// user
// Made a micro web application that was hosted using AWS Amplify, wrote a lambda
// function that will be invoked by an API endpoint made using AWS API gateway which
// in turn will push the relevant information to a Dynamo DB database
// Full Stack Developer 07/2022 - 02/2023
// Twilio Inc Gurgaon
// Developed a UI for operations like viewing account information from Salesforce,
// keyword detection which will have a list of accounts sending abuse messages, adding
// new filters that would help in the early detection of spam accounts and significantly
// reduce a specialist's account review time by ~50%
// Worked on a tool which helped ops specialists to track spam detection filters and
// improve its efficacy over a period of time
// This tool queries a huge dataset stored in Presto and Salesforce to aggregate and
// use random sampling to create Jira tickets that Ops specialists can review and
// reduce false positive rate of the actual spam detection system
// Devised unit tests for both frontend and backend repositories to achieve code
// coverage more than 80% using jest, cypress and pytest
// Developed and enhanced multiple python based backend repositories like integrating
// with sonarqube, removing code smells, code duplications and resolving snyk based
// PRs
// Software Intern 06/2021 - 07/2021
// Twilio Inc Bangalore
// Built a full stack application from scratch that would serve as a one-stop solution to
// perform punitive tasks such as account suspension, blocking an account for
// accounts sending abuse message using Twilio platform
// The project significantly reduced the time in reviewing an account from 5mins to
// 2mins 15 secs consequently saving us ~$66000 annually`;

//     const fetchQuestions = async () => {
//       const result = await getGeminiQuestions(jobDescription, resume);
//       setQuestions(result.questions);
//       setLoading(false);
//     };

//     fetchQuestions();
//   }, []);