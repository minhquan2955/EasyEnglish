import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import ChildrenEnglish from "./pages/ChildrenEnglish";
import KindergartenEnglish from "./pages/KindergartenEnglish";
import TeenEnglish from "./pages/TeenEnglish";
import IeltsEnglish from "./pages/IeltsEnglish";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-canvas-light font-sans text-ink flex flex-col">
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/tieng-anh-mau-giao" element={<KindergartenEnglish />} />
            <Route path="/tieng-anh-thieu-nhi" element={<ChildrenEnglish />} />
            <Route path="/tieng-anh-thieu-nien" element={<TeenEnglish />} />
            <Route path="/tieng-anh-ielts" element={<IeltsEnglish />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
