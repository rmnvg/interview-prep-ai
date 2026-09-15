import logo from '../assets/logo_back.png'  
 const LoaderPage = () => {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-white z-50">
        <div className="relative">
          <div className="spinner-outer"></div>
          <div className="spinner-inner "></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="w-11 text-black"><img src={logo} alt="" /></span>
          </div>
        </div>
      </div>
    );
  };
export default LoaderPage;