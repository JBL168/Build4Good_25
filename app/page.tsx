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

  // Function to save data to CSV file
  const saveToCSV = async (data) => {
    try {
      // Format the data for CSV
      const formattedStartDate = data.startDate ? data.startDate.toLocaleDateString() : '';
      const formattedEndDate = data.endDate ? data.endDate.toLocaleDateString() : '';
      
      // Create CSV row
      const csvData = {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        task: data.task,
        purpose: data.purpose
      };
      
      // Make API call to save CSV data
      const response = await fetch('/save-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(csvData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save data');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving to CSV:', error);
      throw error;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
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
    
    const formData = {
      startDate,
      task: inputValue,
      endDate,
      purpose: purposeValue
    };
    
    console.log(formData);
    
    try {
      await saveToCSV(formData);
      setIsSubmitted(true);
    } catch (error) {
      alert("Error saving task: " + error.message);
    }
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
          <p className="text-white text-xl font-display mb-2 text-center">What do you want to learn?:</p>
        </div>
        
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleInputChange}
          className={`py-2 px-4 z-10 text-xl text-center text-black bg-[#f5f5f0] cursor-default font-display sm:text-lg md:text-xl whitespace-nowrap resize-none overflow-hidden rounded-md ${formErrors.task ? 'border-2 border-red-500' : ''}`}
          placeholder="Enter..."
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
          placeholder="Enter..."
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
          <div className="mt-8 flex justify-center animate-fade-in">
            <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <iframe src="https://loud-sapphire-b9b.notion.site/ebd/1c543457654c80b9a372ff8d4c7ae2f4" width="1000" height="900" frameborder="0" allowfullscreen />
              <h2 className="text-2xl font-bold text-green-600 mb-2">Task Scheduled!</h2>
              <p className="text-gray-700">Your learning journey has been scheduled successfully.</p>
            </div>
          </div>
        )}

        <div className="hidden w-screen h-px animate-glow md:block animate-fade-right bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />
      </form>
    </div>
  );
}