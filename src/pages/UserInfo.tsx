import React, { useState,useEffect,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, User, Mail, Key } from 'lucide-react';
// import pdfToText from 'react-pdftotext';

// import LoaderPage from './Loader.tsx';

const UserInfo: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // const [resumeText, setResumeText] = useState('');
  // const [resumeFileName, setResumeFileName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  // const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const appRef = useRef(null);

  const enterFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    }
  };

  useEffect(() => {
    // Alert on exit from fullscreen
    const handleFullScreenChange = () => {
      if (
        !document.fullscreenElement
      ) {
        alert("You exited full screen mode.");
        enterFullScreen();
      }
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    // document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
    // document.addEventListener("msfullscreenchange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      // document.removeEventListener("webkitfullscreenchange", handleFullScreenChange);
      // document.removeEventListener("msfullscreenchange", handleFullScreenChange);
    };
  }, []);
 

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if(password!='1234' && password!='7VX7ra9Q' ){
      newErrors.password="Incorrect Password";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
// function extractText(event: React.ChangeEvent<HTMLInputElement>) {
//   const file = event.target.files?.[0];
//   if (file) {
//       pdfToText(file)
//           .then((text) => {console.log(text);setResumeText(text)})
//           .catch((error: Error) => console.error("Failed to extract text from pdf", error));
//   } else {
//       console.error("No file selected");
//   }
// }

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   // setResumeFileName(file.name);
    
  //   // Parse file content
  //   const reader = new FileReader();
  //   reader.onload = (event) => {
  //     const content = event.target?.result as string;
  //     setResumeText(content || '');
  //   };
  //   reader.onerror = () => {
  //     setErrors({ ...errors, resume: 'Failed to read file' });
  //   };
  //   reader.readAsText(file);
  // };
  


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Set loading state to true
      setIsLoading(true);
      
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        let newProfile = '';
        if (email === 'shreehari3@yahoo.com' || email=='suhanisjain23@gmail.com' || email=='kanika.bansal.met20@itbhu.ac.in' || email=='arya.vivek@gmail.com' || email=='it.amitagarwal@gmail.com' || email=='aayushsinghla@gmail.com') {
          newProfile = 'java';
        }
        if (email === 'k.khare@outlook.com' || email== 'abdulateek36@gmail.com' ||  email=='viveksaha.arjun@gmail.com') {
          newProfile = '.net';
        }

        if(password==='1234'){
          newProfile='.java'
        }
        else{
          newProfile='.net'
        }
        enterFullScreen();
        // alert(resumeText);
        navigate(`/questions/${newProfile}`, { 
          state: { 
            name, 
            email,
            profile: newProfile,
            // resumeText: resumeText
          } 
        });
      } catch (error) {
        console.error('Error during submission:', error);
        setIsLoading(false);
      }
    }
  };
  
  // if (isLoading) {
  //   return <LoaderPage />;
  // }
  
  return (
    <div  ref={appRef}>

    <div className="container mx-auto px-3 py-4 max-w-md">
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-orange-600 mb-2">AI Interview</h1>
          <p className="text-gray-600 text-sm">Please provide your details to begin the interview process</p>
        </div>
        
        <div className="w-full h-1 bg-gray-100 mb-4 rounded-full overflow-hidden">
          <div className="h-full bg-orange-500 w-1/3 rounded-full"></div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`pl-10 w-full py-2 px-4 border ${errors.name ? 'border-orange-400' : 'border-gray-300'} rounded-md shadow-sm focus:ring-yellow-500 focus:border-red-300 text-sm`}
                placeholder="Enter your full name"
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pl-10 w-full py-2 px-4 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-orange-400 focus:border-orange-400 text-sm`}
                placeholder="Enter your email address"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="Password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key size={18} className="text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`pl-10 w-full py-2 px-4 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-orange-400 focus:border-orange-400 text-sm`}
                placeholder="Enter Password"
              />
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
          
          {/* <div className="space-y-2">
            <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
              Upload Resume
            </label>
            <div className="relative">
            
              
              <div className="flex items-center bg-gray-200">
                  <FileText size={18} className="mr-2 text-gray-400" />
                  <input className='' type="file" accept="application/pdf" onChange={extractText}/>
              </div>
            </div>
            {resumeText && (
              <div className="mt-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-xs text-gray-600 font-medium">Resume parsed successfully</p>
                <p className="text-xs text-gray-500 truncate">
                  {resumeText.substring(0, 100)}...
                </p>
              </div>
            )}
            {errors.resume && <p className="text-red-500 text-xs mt-1">{errors.resume}</p>}
          </div> */}
          
          <div className="">
            <button 
              type="submit" 
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-400 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="mr-2">Processing</span>
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                </>
              ) : (
                <>
                  Start Interview
                  <ArrowRight size={18} className="ml-2" />
                </>
              )}
            </button>
          </div>
        </form>
        
        {/* <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div> */}
      </div>
      
      <div className="mt-3 flex justify-center space-x-4">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
            <User size={16} className="text-red-400" />
          </div>
          <span className="ml-2 text-sm text-gray-600">User Info</span>
        </div>
        <div className="w-8 h-1 bg-gray-200 self-center"></div>
        <div className="flex items-center opacity-50">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-500">2</span>
          </div>
          <span className="ml-2 text-sm text-gray-500">Questions</span>
        </div>
        <div className="w-8 h-1 bg-gray-200 self-center"></div>
        <div className="flex items-center opacity-50">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-500">3</span>
          </div>
          <span className="ml-2 text-sm text-gray-500">Results</span>
        </div>
      </div>
    </div>
    </div>
  );
};

export default UserInfo;