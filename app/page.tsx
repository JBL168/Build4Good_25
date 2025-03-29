"use client";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import Particles from "./components/particles";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const navigation = [
  { name: "Projects", href: "/projects" },
  { name: "Contact", href: "/contact" },
];

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [purposeValue, setPurposeValue] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formattedOutput, setFormattedOutput] = useState("");
  const textareaRef = useRef(null);
  const purposeTextareaRef = useRef(null);
  const [startCalendarOpen, setStartCalendarOpen] = useState(false);
  const [endCalendarOpen, setEndCalendarOpen] = useState(false);

  // Auto-resize function
  const autoResize = (textareaRef) => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  // Handle textarea input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (formErrors.task) {
      setFormErrors({...formErrors, task: null});
    }
    autoResize(textareaRef);
  };

  // Handle purpose textarea input change
  const handlePurposeChange = (e) => {
    setPurposeValue(e.target.value);
    if (formErrors.purpose) {
      setFormErrors({...formErrors, purpose: null});
    }
    autoResize(purposeTextareaRef);
  };

  // Handle date changes
  const handleStartDateChange = (date) => {
    setStartDate(date);
    if (formErrors.startDate) {
      setFormErrors({...formErrors, startDate: null});
    }
    if (formErrors.endDate && date && endDate && date <= endDate) {
      setFormErrors({...formErrors, startDate: null, endDate: null});
    }
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    if (formErrors.endDate) {
      setFormErrors({...formErrors, endDate: null});
    }
    if (formErrors.startDate && startDate && date && startDate <= date) {
      setFormErrors({...formErrors, startDate: null, endDate: null});
    }
  };

  // Format date to MM-DD-YYYY
  const formatDate = (date) => {
    if (!date) return "";
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const errors = {};
    
    if (!inputValue.trim()) {
      errors.task = "Please enter a task description";
    }
    
    if (!startDate) {
      errors.startDate = "Please select a start date";
    }
    
    if (!endDate) {
      errors.endDate = "Please select an end date";
    }
    
    if (startDate && endDate && startDate > endDate) {
      errors.endDate = "End date must be after start date";
    }
    
    if (!purposeValue.trim()) {
      errors.purpose = "Please explain why you want to learn this topic";
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Create the formatted string
    const formattedString = `'${formatDate(startDate)}', '${formatDate(endDate)}', '${inputValue}', '${purposeValue}'`;
    setFormattedOutput(formattedString);
    
    // Save to file (this will only work in Node.js environment, not in browser)
    // In a real Next.js app, you'd need to use an API route to save the file
    try {
      // Create a blob and download it as a text file
      const blob = new Blob([formattedString], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'task_data.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error saving file:", error);
    }
    
    console.log({
      task: inputValue,
      startDate,
      endDate,
      purpose: purposeValue,
      formattedString
    });
    
    setIsSubmitted(true);
    
    alert("Task scheduled successfully!");
  };

  // Initial resize and resize on value change
  useEffect(() => {
    autoResize(textareaRef);
  }, [inputValue]);

  useEffect(() => {
    autoResize(purposeTextareaRef);
  }, [purposeValue]);

  // Scroll to bottom when form is submitted
  useEffect(() => {
    if (isSubmitted) {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [isSubmitted]);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-screen overflow-x-hidden bg-gradient-to-tl from-black via-zinc-600/20 to-black">
      <nav className="my-8 animate-fade-in">
        <ul className="flex items-center justify-center gap-4">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm duration-100 text-zinc-500 hover:text-zinc-300"
            >
              {item.name}
            </Link>
          ))}
        </ul>
      </nav>
      <div className="hidden w-screen h-px animate-glow md:block animate-fade-left bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />
      
      <form onSubmit={handleSubmit} className="duration-150 flex flex-col items-center justify-center animate-fade-in w-full pb-20"> 
        <Particles
          className="fixed inset-0 -z-10 animate-fade-in"
          quantity={1000}
        />
        <h1 className=" py-5 text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 text-center">
          Gantt Task Scheduler
        </h1>
        
        <div className="w-4/5 mb-2">
          <p className="text-white text-xl font-display mb-2 text-center">Task Description:</p>
        </div>
        
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleInputChange}
          className={`py-2 px-4 z-10 text-xl text-center text-black bg-[#f5f5f0] cursor-default font-display sm:text-lg md:text-xl whitespace-nowrap resize-none overflow-hidden rounded-md ${formErrors.task ? 'border-2 border-red-500' : ''}`}
          placeholder="Enter task description..."
          style={{ minHeight: "50px", width: "80%" }}
          rows={1}
          required
        />
        {formErrors.task && (
          <p className="text-red-500 text-sm mt-1">{formErrors.task}</p>
        )}
        
        <div className=" py-1 w-4/5 mb-2 mt-8">
          <p className=" text-white text-xl font-display mb-2 text-center">Why do you want to learn this topic?</p>
        </div>
        
        <textarea
          ref={purposeTextareaRef}
          value={purposeValue}
          onChange={handlePurposeChange}
          className={`py-2 px-4 z-10 text-xl text-center text-black bg-[#f5f5f0] cursor-default font-display sm:text-lg md:text-xl resize-none overflow-hidden rounded-md ${formErrors.purpose ? 'border-2 border-red-500' : ''}`}
          placeholder="Explain why you want to learn this topic or what you're learning it for..."
          style={{ minHeight: "80px", width: "80%", marginBottom: "30px" }}
          rows={2}
          required
        />
        {formErrors.purpose && (
          <p className="text-red-500 text-sm mt-1">{formErrors.purpose}</p>
        )}
          
        <div className="flex justify-center w-full">
          <div className="flex flex-col md:flex-row justify-center gap-8 w-4/5 py-2">
            <div className="flex flex-col items-center">
              <p className="text-white text-xl font-display mb-2 text-center">Start Date:</p>
              <div className="flex justify-center w-full">
                <DatePicker
                  selected={startDate}
                  onChange={handleStartDateChange}
                  dateFormat="MM/dd/yyyy"
                  className={`py-2 px-4 text-xl text-center text-black bg-[#f5f5f0] font-display rounded-md ${formErrors.startDate ? 'border-2 border-red-500' : ''}`}
                  placeholderText="MM/DD/YYYY"
                  wrapperClassName="w-full flex justify-center"
                  popperPlacement="bottom"
                  popperClassName="z-50"
                  onCalendarOpen={() => setStartCalendarOpen(true)}
                  onCalendarClose={() => setStartCalendarOpen(false)}
                  required
                />
              </div>
              {startCalendarOpen && (
                <div className="h-64 w-full"></div>
              )}
              {formErrors.startDate && (
                <p className="text-red-500 text-sm mt-1">{formErrors.startDate}</p>
              )}
            </div>
            <div className="flex flex-col items-center">
              <p className="text-white text-xl font-display mb-2 text-center">End Date:</p>
              <div className="flex justify-center w-full">
                <DatePicker
                  selected={endDate}
                  onChange={handleEndDateChange}
                  dateFormat="MM/dd/yyyy"
                  className={`py-2 px-4 text-xl text-center text-black bg-[#f5f5f0] font-display rounded-md ${formErrors.endDate ? 'border-2 border-red-500' : ''}`}
                  placeholderText="MM/DD/YYYY"
                  wrapperClassName="w-full flex justify-center"
                  popperPlacement="bottom"
                  popperClassName="z-50"
                  onCalendarOpen={() => setEndCalendarOpen(true)}
                  onCalendarClose={() => setEndCalendarOpen(false)}
                  required
                />
              </div>
              {endCalendarOpen && (
                <div className="h-64 w-full"></div>
              )}
              {formErrors.endDate && (
                <p className="text-red-500 text-sm mt-1">{formErrors.endDate}</p>
              )}
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          className=" mt-6 py-3 px-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
        >
          Schedule Task
        </button>

        {isSubmitted && (
          <div className="mt-8 w-4/5 flex flex-col items-center justify-center animate-fade-in">
            <div className="bg-white p-6 rounded-lg shadow-xl text-center w-full">
              <img 
                src="/boo.png"
                alt="Success" 
                className="w-500 h-500 mx-500 mb-4"
              />
              <h2 className="text-2xl font-bold text-green-600 mb-2">Task Scheduled!</h2>
              <p className="text-gray-700 mb-4">Your learning journey has been scheduled successfully.</p>
              
              <div className="mt-4 p-4 bg-gray-100 rounded-md">
                <h3 className="text-lg font-semibold mb-2">Formatted Output:</h3>
                <p className="font-mono text-sm break-all">{formattedOutput}</p>
              </div>
              
              <button 
                onClick={() => {
                  const blob = new Blob([formattedOutput], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'task_data.txt';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="mt-4 py-2 px-4 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600"
              >
                Download as TXT
              </button>
            </div>
          </div>
        )}

        <div className="hidden w-screen h-px animate-glow md:block animate-fade-right bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />
      </form>
    </div>
  );
}
