import React, { useState, useEffect, useCallback,useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { ChevronLeft, ChevronRight} from 'lucide-react';
import { RecordAnswer } from './record';
import LoaderPage from './Loader.tsx';

import * as blazeface from '@tensorflow-models/blazeface';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';
import { syncCanvasToVideo, drawAllDetections } from '../utils/faceDetection';

interface LocationState {
  name: string;
  email: string;
  profile: string;
  // resumeText:string
}

interface Movement {
  x: string;
  y: string;
}

interface Violation {
  multipleFaces: boolean;
  lookingAway: boolean;
  usingDevice: boolean;
}

interface DetectionResults {
  faceCount: number;
  movement: Movement;
  devices: string[];
  violations: Violation;
}

//#region questions generated using gemini
interface AIResponse {
  questions: { question: string }[];
}


async function getGeminiQuestions(
  Jd: string,
  resume: string
): Promise<{ questions: string[] }> {
  const prompt = `Job Description: ${Jd}
  Candidate Resume: ${resume}
  Generate 3 targeted interview questions based on the content of the jd and resume variables, following these criteria:
  -Questions should directly relate to the specific skills, technologies, and responsibilities mentioned in the jd.
  -Questions should be tailored to the candidate's existing experience and background as shown in their resume.
  -Questions should assess both technical competence and practical application of skills.
  -Questions should be direct and address the candidate.
  -Difficulty level should match the seniority level indicated in both the jd and resume

Format your response as a JSON object with the following structure:
{
  "questions": [
    {
      "question": "Complete question text here"
    },
    // 2 more questions following the same structure
  ]
}
`;

  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || `HTTP error! status: ${response.status}`);
    }

    const parsedResult: AIResponse = cleanJsonResponse(data.text);
    console.log(parsedResult);

    const qns = parsedResult.questions.map((item) => item.question);
    // const qns = parsedResult ? parsedResult.questions : [];

    return { questions: qns };
  } catch (error) {
    console.error("Error fetching Gemini feedback:", error);
    return {
      questions: [],
    };
  }
}

const cleanJsonResponse = (responseText: string) => {
  let cleanText = responseText.trim();
  cleanText = cleanText.replace(/(json|```|`)/g, "");
  try {
    return JSON.parse(cleanText);
  } catch (error) {
    throw new Error("Invalid JSON format: " + (error as Error)?.message);
  }
};

//#endregion


const QuestionForm: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cheating,setcheating]=useState<Violation>({multipleFaces:false,lookingAway:false,usingDevice:false})
  const faceDetectionThreshold = 0.85; // Fixed threshold
  const [detectionResults, setDetectionResults] = useState<DetectionResults>({
    faceCount: 0,
    movement: { x: '', y: '' },
    devices: [],
    violations: {
      multipleFaces: false,
      lookingAway: false,
      usingDevice: false
    }
  });
  const location = useLocation();
  const { profile } = useParams<{ profile: string }>();
  const navigate = useNavigate();
  
  const state = location.state as LocationState | null;
  const name = state?.name || '';
  const email = state?.email || '';
  const type = profile || state?.profile || '';
  // const candidateresume=state?.resumeText;
  
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    // Alert on tab switch
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        alert('You switched the tab!');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [])


  useEffect(() => {
    
    //#region setting questions based on resume and jd here
let jobDescription=`We are looking for a passionate and skilled Software Engineer with 2-3 years of experience in C# and .NET development. You'll be responsible for designing, developing, and maintaining scalable, high-performance applications using .NET Core, ASP.NET, and microservices architecture.
 The ideal candidate will have experience in building and deploying robust systems with an emphasis on reliability, performance, and scalability. Strong knowledge of RESTful API design, debugging, and optimization techniques is essential.`;


//     const resume1 = `SDE-2 07/2023 - Present
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

const resume1=`MICROSOFT Software Engineer
Since January 2022, I have worked as a Software Engineer on the Azure For Operator team. I led the launch of the Azure Orchestration Service Manager, successfully onboarding customers globally. I also developed an OpenAI-powered chatbot to automate incident resolution, reducing mitigation time from 2 hours to 30 minutes. In addition, I improved monitoring by utilizing device heartbeats for failure analysis and reduced false alerts. I integrated Azure Lockbox into the service to streamline customer approval workflows, reducing incident resolution time. I also optimized VNF deployment by 5x by creating a resource-aware dependency graph. As a Direct Responsible Individual (DRI), I conducted root cause analyses and enhanced tools, achieving a customer satisfaction score of 4.85/5.
Previously, from July 2020 to January 2022, I worked on the Azure Networking team, where I delivered bug fixes and feature improvements for Azure Network Function Manager (NFM), led VNF deployment on Azure Stack Edge, and automated testing using Azure runbooks, cutting testing time from days to hours. I also improved service resilience during outages and resolved resource state mismatches in offline operations.
Technologies: C#, RPaaS Framework, Service Fabric, Azure, Kubernetes, Azure Stack Edge.

Proficient Skills
I am proficient in Service Fabric, ASP.Net,C#,and database management with Azure Storage, Cosmos DB, and MySQL. I also have experience using AKS and DTF.

Education
I earned an Integrated Masters in Computer Science and Engineering from the International Institute of Information Technology, Bangalore (2015-2020), with a CGPA of 3.50/4.00.

Internships
I interned at Siemens (Jan-Jun 2020), where I worked on landmark detection and geo-visualization for outdoor environments. At Microsoft (May-Jul 2019), I contributed to the Network Diagnostic Tool, displaying resource metrics for gateways and devices. I also interned at Hyperreality Technologies (Jun 2018-May 2019), developing a VR interior design application.

Achievements
I won 1st prize for my project "AI-Customer" in the Annual Hackathon 2023 in the "Copilots for Software Engineering" category. I also received the People’s Choice Award at the LLM Hackathon 2023 for "Azure Copilots for Startups."
`;

    if(type=='java'){
          jobDescription='Basic Qualifications:\n- BS/BE in Computer Science or related technical field or equivalent technical experience\n- 7+ years of industry experience in software design, development, and algorithm related solutions\n- 5+ years of experience programming in object-oriented languages such as Java\n- 2+ years of experience as an architect, or technical leadership position\n- Proficient in Spring Framework.\n- Hands-on experience developing large-scale, distributed systems, and databases\n- Hands-on experience of cloud platforms (Preferebally AWS)\n- Good to have experience on any Orchestartion Platform like Camunda.\nPreferred Qualifications:\n- MS or PhD degree in Computer Science or related technical discipline\n- 10+ years of experience in software design, development, and algorithm related solutions with at least 5 years of experience in a technical leadership position\n- 7+ years of experience in an object-oriented programming language such as Java\n- 5+ years of experience with large-scale distributed systems and client-server architectures\n- Experience in architecting and designing large-scale distributed systems related to data infrastructure, Kubernetes, and platforms.\n- Hands-on experience of cloud platforms (Preferebally AWS)';
    }
    // if(candidateresume!=null){
    //   resume=candidateresume;
    // }
    const fetchQuestions = async () => {
      const result = await getGeminiQuestions(jobDescription, resume1);
      setQuestions(result.questions);
      setLoading(false);
    };
    //#endregion

    fetchQuestions();
  },[type]);
  
//#region mapped questions hardcoded
  // const questions = React.useMemo(() => {
  //   switch (type) {
  //     case 'java':
  //       return [
  //         "Explain the difference between ArrayList and LinkedList in Java. When would you use one over the other?",
  //         "What are the key differences between a HashMap and a TreeMap in Java?",
  //         "What is the purpose of the `final` keyword in Java? Explain its usage in variables, methods, and classes."
  //       ];
  //     case '.net':
  //       return [
  //         "What are the main differences between .NET Core and .NET Framework?",
  //         "Explain how garbage collection works in .NET and how you can manage memory manually.",
  //         "What is dependency injection in .NET, and how do you implement it in a .NET application?"
  //       ];
  //     case 'c++':
  //       return [
  //         "What is the difference between a pointer and a reference in C++? Provide examples.",
  //         "Explain the concept of RAII (Resource Acquisition Is Initialization) in C++.",
  //         "What are the differences between `new` and `malloc` in C++? When should each be used?"
  //       ];
  //     case 'python':
  //       return [
  //         "What is the difference between a list and a tuple in Python?",
  //         "How do you handle exceptions in Python? Provide an example using try and except.",
  //         "What is a dictionary in Python and how do you add key-value pairs to it?"
  //       ];
      
  //     default:
  //       return [
  //         "What's your experience with design tools?",
  //         "Describe your design process",
  //         "Share an example of a design problem you solved"
  //       ];
  //   }
  // }, [type]);

  //#endregion
  
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  // Use useCallback to memoize the navigation check
  const checkNavigation = useCallback(() => {
    if (!state && !profile) {
      navigate('/');
    }
  }, [state, navigate, profile]);

  useEffect(() => {
    checkNavigation();
  }, [checkNavigation]);
  useEffect(() => {
    // Alert on exit from fullscreen
    const handleFullScreenChange = () => {
      if (
        !document.fullscreenElement
      ) {
        alert("You exited full screen mode.");
        
      }
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
    document.addEventListener("msfullscreenchange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullScreenChange);
      document.removeEventListener("msfullscreenchange", handleFullScreenChange);
    };
  }, []);

  
  // Memoize handleAnswerChange to prevent unnecessary re-renders
  const handleAnswerChange = useCallback((question: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [question]: answer }));
  }, []);

  const goToNextQuestion = useCallback(() => {
    if (activeQuestionIndex < questions.length - 1) {
      setActiveQuestionIndex(prev => prev + 1);
    }
  }, [activeQuestionIndex, questions.length]);

  const goToPreviousQuestion = useCallback(() => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(prev => prev - 1);
    }
  }, [activeQuestionIndex]);

  const handleSubmit = useCallback(async () => {
    const unansweredQuestions = questions.filter(q => !answers[q] || answers[q].trim() === '');

    if (unansweredQuestions.length > 0) {
      alert(`Please answer all questions before submitting.`);
      return;
    }

    setIsSubmitting(true);

    try {
      // let answersSummary = '';
      // questions.forEach((question) => {
      //   answersSummary += `Question: ${question}\nAnswer: ${answers[question] || 'No answer'}\n\n`;
      // });

      // alert(answersSummary); 
      console.log("Navigating to feedback page with answers:", answers);
      
      navigate('/feedback', {
        state: { 
          answers, 
          profile: type, 
          questions,
          name,
          email,
          cheating 
        },
      });
      window.location.reload();
    } catch (error) {
      console.error("Error submitting interview:", error);
      alert("There was an error submitting your interview. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, questions, type, name, email, navigate]);

  const progressPercentage = ((activeQuestionIndex + 1) / questions.length) * 100;
  const loadModelsAndDetect = async (): Promise<() => void> => {
    // Load models
    const faceModel = await blazeface.load();
    const cocoModel = await cocoSsd.load();
    
    let rafId: number;
    let isRunning = true;
    let frameCount = 0;
    let lastObjects: any[] = [];
    let lastFaces: any[] = [];

    const processFrame = async () => {
      if (!isRunning) return;
      
      if (
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.readyState === 4 &&
        canvasRef.current
      ) {
        const video = webcamRef.current.video;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return;

        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        // Only sync canvas if dimensions changed
        if (videoWidth > 0 && videoHeight > 0) {
          syncCanvasToVideo(canvas, video);
          
          // Get face detections every frame (fast)
          let faces = lastFaces;
          try {
            faces = await faceModel.estimateFaces(video, false);
            lastFaces = faces;
          } catch (error) {
            console.warn('Face detection error:', error);
          }
          
          // Get object detections every 3 frames for better synchronization
          let objects = lastObjects;
          if (frameCount % 3 === 0) {
            try {
              objects = await cocoModel.detect(video);
              lastObjects = objects;
            } catch (error) {
              console.warn('Object detection error:', error);
            }
          }
          
          // Always draw both cached and current detections for smooth display
          drawAllDetections(ctx, faces as any[], objects, videoWidth, true, faceDetectionThreshold, 0.3);
          
          // Process video frame for other detections (less frequent)
          if (frameCount % 5 === 0) {
            const results = await processVideoFrame(video, faceModel, cocoModel);
            setDetectionResults(results);
          }
          
          frameCount++;
        }
      }
      
      // Schedule next frame
      if (isRunning) {
        rafId = requestAnimationFrame(processFrame);
      }
    };

    // Start the detection loop
    processFrame();

    return () => {
      isRunning = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  };

  // Process video frame to detect faces and devices
  const processVideoFrame = async (
    video: HTMLVideoElement,
    faceModel: blazeface.BlazeFaceModel,
    cocoModel: cocoSsd.ObjectDetection
  ): Promise<DetectionResults> => {
    // Detect faces
    const faces = await faceModel.estimateFaces(video, false);
    
    // Detect objects (devices)
    const predictions = await cocoModel.detect(video);
    const detectedDevices = predictions
      .filter(pred => ["cell phone", "laptop", "tv", "monitor"].includes(pred.class))
      .map(pred => pred.class);

    // Calculate head movement
    let movement: Movement = { x: '', y: '' };
    
    if (faces.length > 0) {
      const face = faces[0];
      // const x = face.topLeft[0] as number;
      // const y = face.topLeft[1] as number;
      // const x2 = face.bottomRight[0] as number;
      // const y2 = face.bottomRight[1] as number;
      const [x, y] = face.topLeft as [number, number];
  const [x2, y2] = face.bottomRight as [number, number];

      
      const centerX = (x + x2) / 2;
      const centerY = (y + y2) / 2;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      // Determine head direction
      let dirX = '';
      let dirY = '';

      if (centerX < videoWidth * 0.3) dirX = 'Left';
      else if (centerX > videoWidth * 0.7) dirX = 'Right';
      else dirX = 'Center';

      if (centerY < videoHeight * 0.3) dirY = 'Up';
      else if (centerY > videoHeight * 0.7) dirY = 'Down';
      else dirY = 'Center';

      movement = { x: dirX, y: dirY };
    }

    // Determine violations
    const violations: Violation = {
      multipleFaces: faces.length > 1,
      lookingAway: movement.x !== 'Center' || movement.y !== 'Center',
      usingDevice: detectedDevices.length > 0
    };
    // if(violations.multipleFaces){
    //   cheating.multipleFaces=true;
    // }
    // if(violations.lookingAway){
    //   cheating.lookingAway=true;
    // }
    // if(violations.usingDevice){
    //   cheating.usingDevice=true;
    // }
    if (violations.multipleFaces || violations.lookingAway || violations.usingDevice) {
      setcheating(prev => ({
        ...prev,
        multipleFaces: prev.multipleFaces || violations.multipleFaces,
        lookingAway: prev.lookingAway || violations.lookingAway,
        usingDevice: prev.usingDevice || violations.usingDevice,
      }));
    }
    


    return {
      faceCount: faces.length,
      movement,
      devices: detectedDevices,
      violations
    };
  };

  // Draw detection results on canvas
  // const drawResultsOnCanvas = (
  //   results: DetectionResults,
  //   videoWidth: number,
  //   videoHeight: number
  // ): void => {
  //   const canvas = canvasRef.current;
  //   if (!canvas) return;
    
  //   const ctx = canvas.getContext('2d');
  //   if (!ctx) return;
    
  //   // Clear previous drawings
  //   ctx.clearRect(0, 0, videoWidth, videoHeight);
    
  //   // Get raw detection data again to draw bounding boxes
  //   if (webcamRef.current && webcamRef.current.video) {
  //     const video = webcamRef.current.video;
      
  //     // Redraw faces and devices
  //     Promise.all([
  //       blazeface.load().then(model => model.estimateFaces(video, false)),
  //       cocoSsd.load().then(model => model.detect(video))
  //     ]).then(([faces, predictions]) => {
  //       // Draw face bounding boxes
  //       faces.forEach(face => {
  //         const x = face.topLeft[0] as number;
  //         const y = face.topLeft[1] as number;
  //         const width = (face.bottomRight[0] as number) - x;
  //         const height = (face.bottomRight[1] as number) - y;
          
  //         ctx.strokeStyle = results.violations.multipleFaces ? "red" : "green";
  //         ctx.lineWidth = 2;
  //         ctx.strokeRect(x, y, width, height);
          
  //         // Draw face landmarks if available
  //         // if (face.landmarks) {
  //         //   face.landmarks.forEach((point: number[]) => {
  //         //     ctx.fillStyle = "blue";
  //         //     ctx.beginPath();
  //         //     ctx.arc(point[0], point[1], 3, 0, 2 * Math.PI);
  //         //     ctx.fill();
  //         //   });
  //         // }
  //       });
        
  //       // Draw device bounding boxes
  //       predictions.forEach(pred => {
  //         if (["cell phone", "laptop", "tv", "monitor"].includes(pred.class)) {
  //           ctx.strokeStyle = "red";
  //           ctx.lineWidth = 2;
  //           ctx.strokeRect(...pred.bbox);
  //           ctx.fillStyle = "red";
  //           ctx.font = "16px Arial";
  //           ctx.fillText(`${pred.class} (${Math.round(pred.score * 100)}%)`, pred.bbox[0], pred.bbox[1] - 10);
  //         }
  //       });
  //     });
  //   }
  // };

  useEffect(() => {
    // Initialize TensorFlow and start detection
    let cleanup: () => void;
    
    tf.ready()
      .then(() => loadModelsAndDetect())
      .then(cleanupFn => {
        cleanup = cleanupFn;
      })
      .catch(error => {
        console.error("Error initializing models:", error);
      });
    
    // Handle window resize to update canvas alignment
    const handleResize = () => {
      if (webcamRef.current?.video && canvasRef.current) {
        syncCanvasToVideo(canvasRef.current, webcamRef.current.video);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up on component unmount
    return () => {
      if (cleanup) cleanup();
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  const getStatusMessage = () => {
    const { violations } = detectionResults;
    
    if (detectionResults.faceCount === 0) {
      return <span className="status-error">No face detected</span>;
    }
    
    if (violations.multipleFaces) {
      return <span className="status-error">Multiple faces detected</span>;
    }
    
    if (violations.lookingAway) {
      return <span className="status-warning">Looking away from screen</span>;
    }
    
    if (violations.usingDevice) {
      return <span className="status-error">Electronic device detected</span>;
    }
    
    return <span className="status-ok">All good</span>;
  };


  return (
    loading?<LoaderPage/>:
    <div>
      <div className="detection-results bg-gray-100 p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
          Monitoring Status: {getStatusMessage()}
        </h3>

        <div className="results-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="result-item bg-white p-4 rounded-lg shadow-md">
            <h4 className="text-xl font-semibold text-gray-700 mb-2">
              Face Detection
            </h4>
            <p className="text-gray-600">
              Count:{" "}
              <strong className="text-gray-800">
                {detectionResults.faceCount}
              </strong>
            </p>
            <p
              className={
                detectionResults.violations.multipleFaces
                  ? "text-red-600 font-bold"
                  : "text-green-600 font-bold"
              }
            >
              {detectionResults.violations.multipleFaces
                ? "⚠️ Multiple faces"
                : "✅ Single face"}
            </p>
          </div>

          <div className="result-item bg-white p-4 rounded-lg shadow-md">
            <h4 className="text-xl font-semibold text-gray-700 mb-2">
              Head Direction
            </h4>
            <p className="text-gray-600">
              X:{" "}
              <strong className="text-gray-800">
                {detectionResults.movement.x || "Center"}
              </strong>
              , Y:{" "}
              <strong className="text-gray-800">
                {detectionResults.movement.y || "Center"}
              </strong>
            </p>
            <p
              className={
                detectionResults.violations.lookingAway
                  ? "text-red-600 font-bold"
                  : "text-green-600 font-bold"
              }
            >
              {detectionResults.violations.lookingAway
                ? "⚠️ Looking away"
                : "✅ Looking at screen"}
            </p>
          </div>

          <div className="result-item bg-white p-4 rounded-lg shadow-md">
            <h4 className="text-xl font-semibold text-gray-700 mb-2">
              Electronic Devices
            </h4>
            <p className="text-gray-600">
              Detected:{" "}
              <strong className="text-gray-800">
                {detectionResults.devices.length > 0
                  ? detectionResults.devices.join(", ")
                  : "None"}
              </strong>
            </p>
            <p
              className={
                detectionResults.violations.usingDevice
                  ? "text-red-600 font-bold"
                  : "text-green-600 font-bold"
              }
            >
              {detectionResults.violations.usingDevice
                ? "⚠️ Device detected"
                : "✅ No devices"}
            </p>
          </div>
        </div>
      </div>
    <div className="container mx-auto px-4 py-6 ">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="header-gradient-bg text-white p-4">
          <h1 className="text-xl font-bold">
            {type ? `${type.charAt(0).toUpperCase() + type.slice(1)} Developer Interview` : 'Interview'}
          </h1>
          <p className="text-white font-bold text-sm mt-1">
            Answering as: {name} ({email})
          </p>
        </div>

        <div className="w-full h-2 bg-gray-200">
          <div 
            className="h-full bg-red-400 transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4">
          <div className="md:w-2/5">
            <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-300 relative">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                width="100%"
                height="auto"
                videoConstraints={{ facingMode: 'user' }}
                className="rounded-lg"
                mirrored={true}
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 pointer-events-none"
                style={{ 
                  zIndex: 10
                }}
              />
            </div>
          </div>
          {/* Question section */}
          <div className="md:w-3/5">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">
                Question {activeQuestionIndex + 1} of {questions.length}
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                Answer the question below using text or voice recording
              </p>

              <div className="bg-white rounded-lg p-4 border border-gray-300 ">
                <h3 className="text-lg font-medium text-gray-800 mb-3">
                  {questions[activeQuestionIndex]}
                </h3>
                <RecordAnswer
                  key={activeQuestionIndex}  
                  onSaveAnswer={(answer: string) => handleAnswerChange(questions[activeQuestionIndex], answer)}
                  value={answers[questions[activeQuestionIndex]] || ''}
                />
              </div>

              <div className="mt-4 flex justify-between">
                <button 
                  onClick={goToPreviousQuestion}
                  disabled={activeQuestionIndex === 0}
                  className={`flex items-center px-3 py-2 rounded-md text-sm ${activeQuestionIndex === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  <ChevronLeft size={16} className="mr-1" /> Previous
                </button>

                {activeQuestionIndex < questions.length - 1 ? (
                  <button 
                    onClick={goToNextQuestion}
                    className="flex items-center px-3 py-2 rounded-md text-sm bg-orange-600 text-white hover:bg-orange-500 transition-colors"
                  >
                    Next <ChevronRight size={16} className="ml-1" />
                  </button>
                ) : (
                  <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center px-4 py-2 rounded-md text-sm bg-orange-300 text-white hover:bg-orange-400 transition-colors disabled:bg-red-300"
                  >
                    {isSubmitting ? (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      "Submit Interview"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default QuestionForm;