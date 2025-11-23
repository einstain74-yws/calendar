"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Settings,
  Menu,
  Clock,
  MapPin,
  Users,
  Calendar,
  Pause,
  Sparkles,
  X,
  LogOut,
} from "lucide-react"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])
  const [isLoaded, setIsLoaded] = useState(false)
  const [showAIPopup, setShowAIPopup] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    setIsLoaded(true)

    // Show AI popup after 3 seconds
    const popupTimer = setTimeout(() => {
      setShowAIPopup(true)
    }, 3000)

    return () => clearTimeout(popupTimer)
  }, [])

  useEffect(() => {
    if (showAIPopup) {
      const text =
        "LLooks like you don't have that many meetings today. Shall I play some Hans Zimmer essentials to help you get into your Flow State?"
      let i = 0
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setTypedText((prev) => prev + text.charAt(i))
          i++
        } else {
          clearInterval(typingInterval)
        }
      }, 50)

      return () => clearInterval(typingInterval)
    }
  }, [showAIPopup])

  const [currentView, setCurrentView] = useState("week")
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day
    return new Date(today.setDate(diff))
  })
  const [currentDayDate, setCurrentDayDate] = useState(new Date())
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showAddEventDialog, setShowAddEventDialog] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingEventId, setEditingEventId] = useState(null)
  const [newEvent, setNewEvent] = useState({
    title: "",
    startTime: "",
    endTime: "",
    description: "",
    location: "",
    date: new Date(),
    color: "bg-blue-500",
  })
  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date())

  // Helper functions for date calculations
  const getWeekDates = (weekStart) => {
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const formatDate = (date) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }

  const formatMonthYear = (date) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    )
  }

  const weekDates = getWeekDates(currentWeekStart)
  const currentMonth = formatMonthYear(weekDates[3]) // Middle of the week
  const currentDate = formatDate(weekDates[0])

  // Navigation functions
  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentWeekStart(newDate)
  }

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentWeekStart(newDate)
  }

  const goToToday = () => {
    const today = new Date()
    if (currentView === "day") {
      setCurrentDayDate(new Date(today))
    } else if (currentView === "week") {
      const day = today.getDay()
      const diff = today.getDate() - day
      setCurrentWeekStart(new Date(today.setDate(diff)))
    } else if (currentView === "month") {
      setCurrentMonthDate(new Date(today))
    }
  }

  // Day view navigation
  const goToPreviousDay = () => {
    const newDate = new Date(currentDayDate)
    newDate.setDate(newDate.getDate() - 1)
    setCurrentDayDate(newDate)
  }

  const goToNextDay = () => {
    const newDate = new Date(currentDayDate)
    newDate.setDate(newDate.getDate() + 1)
    setCurrentDayDate(newDate)
  }

  // Month view navigation
  const goToPreviousMonthView = () => {
    const newDate = new Date(currentMonthDate)
    newDate.setMonth(newDate.getMonth() - 1)
    setCurrentMonthDate(newDate)
  }

  const goToNextMonthView = () => {
    const newDate = new Date(currentMonthDate)
    newDate.setMonth(newDate.getMonth() + 1)
    setCurrentMonthDate(newDate)
  }

  const handlePrevious = () => {
    if (currentView === "day") {
      goToPreviousDay()
    } else if (currentView === "week") {
      goToPreviousWeek()
    } else if (currentView === "month") {
      goToPreviousMonthView()
    }
  }

  const handleNext = () => {
    if (currentView === "day") {
      goToNextDay()
    } else if (currentView === "week") {
      goToNextWeek()
    } else if (currentView === "month") {
      goToNextMonthView()
    }
  }

  // Get month calendar days
  const getMonthCalendarDays = () => {
    const year = currentMonthDate.getFullYear()
    const month = currentMonthDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const days = []
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  // Get current display date based on view
  const getCurrentDisplayDate = () => {
    if (currentView === "day") {
      return formatDate(currentDayDate)
    } else if (currentView === "week") {
      return currentDate
    } else {
      return formatMonthYear(currentMonthDate)
    }
  }

  const goToPreviousMonth = () => {
    const newDate = new Date(miniCalendarDate)
    newDate.setMonth(newDate.getMonth() - 1)
    setMiniCalendarDate(newDate)
  }

  const goToNextMonth = () => {
    const newDate = new Date(miniCalendarDate)
    newDate.setMonth(newDate.getMonth() + 1)
    setMiniCalendarDate(newDate)
  }

  const handleMiniCalendarDayClick = (day) => {
    const selectedDate = new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth(), day)
    const dayOfWeek = selectedDate.getDay()
    const weekStart = new Date(selectedDate)
    weekStart.setDate(selectedDate.getDate() - dayOfWeek)
    setCurrentWeekStart(weekStart)
  }

  const handleEventClick = (event) => {
    setSelectedEvent(event)
  }

  const handleTimeSlotClick = (dateIndexOrDate, timeSlot) => {
    const startTime = `${timeSlot < 10 ? "0" : ""}${timeSlot}:00`
    const endTime = `${timeSlot + 1 < 10 ? "0" : ""}${timeSlot + 1}:00`
    
    let selectedDate
    if (currentView === "day") {
      selectedDate = currentDayDate
    } else if (typeof dateIndexOrDate === "number") {
      selectedDate = weekDates[dateIndexOrDate]
    } else {
      selectedDate = dateIndexOrDate
    }
    
    setNewEvent({
      title: "",
      startTime,
      endTime,
      description: "",
      location: "",
      date: selectedDate,
      color: "bg-blue-500",
    })
    setShowAddEventDialog(true)
  }

  const handleSaveEvent = async () => {
    if (!newEvent.title.trim()) {
      alert("제목을 입력해주세요!")
      return
    }

    try {
      if (isEditMode && editingEventId) {
        // Update existing event
        const response = await fetch(`/api/events/${editingEventId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...newEvent,
            date: newEvent.date.toISOString(),
          }),
        })

        if (!response.ok) {
          throw new Error("이벤트 수정에 실패했습니다.")
        }

        const updatedEvent = await response.json()
        setEvents(
          events.map((event) =>
            event.id === editingEventId
              ? {
                  ...updatedEvent,
                  date: new Date(updatedEvent.date),
                  attendees: ["You"],
                  organizer: "You",
                }
              : event,
          ),
        )
      } else {
        // Add new event
        const response = await fetch("/api/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...newEvent,
            date: newEvent.date.toISOString(),
          }),
        })

        if (!response.ok) {
          throw new Error("이벤트 생성에 실패했습니다.")
        }

        const createdEvent = await response.json()
        setEvents([
          ...events,
          {
            ...createdEvent,
            date: new Date(createdEvent.date),
            attendees: ["You"],
            organizer: "You",
          },
        ])
      }

      handleCloseDialog()
    } catch (error) {
      console.error("이벤트 저장 오류:", error)
      alert("이벤트 저장에 실패했습니다.")
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (confirm("이 이벤트를 삭제하시겠습니까?")) {
      try {
        const response = await fetch(`/api/events/${eventId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("이벤트 삭제에 실패했습니다.")
        }

        setEvents(events.filter((event) => event.id !== eventId))
        setSelectedEvent(null)
      } catch (error) {
        console.error("이벤트 삭제 오류:", error)
        alert("이벤트 삭제에 실패했습니다.")
      }
    }
  }

  const handleEditEvent = (event) => {
    setIsEditMode(true)
    setEditingEventId(event.id)
    setNewEvent({
      title: event.title,
      startTime: event.startTime,
      endTime: event.endTime,
      description: event.description || "",
      location: event.location || "",
      date: event.date,
      color: event.color,
    })
    setSelectedEvent(null)
    setShowAddEventDialog(true)
  }

  const handleCloseDialog = () => {
    setShowAddEventDialog(false)
    setIsEditMode(false)
    setEditingEventId(null)
    setNewEvent({
      title: "",
      startTime: "",
      endTime: "",
      description: "",
      location: "",
      date: new Date(),
      color: "bg-blue-500",
    })
  }

  // Load events from database
  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(true)

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/events")
          if (response.ok) {
            const data = await response.json()
            const eventsWithDates = data.map((event) => ({
              ...event,
              date: new Date(event.date),
              attendees: ["You"],
              organizer: "You",
            }))
            setEvents(eventsWithDates)
          }
        } catch (error) {
          console.error("이벤트 로드 오류:", error)
        } finally {
          setEventsLoading(false)
        }
      }
    }

    fetchEvents()
  }, [status])

  // Week view configuration
  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
  const timeSlots = Array.from({ length: 9 }, (_, i) => i + 8) // 8 AM to 4 PM

  // Helper function to calculate event position and height
  const calculateEventStyle = (startTime, endTime) => {
    const start = Number.parseInt(startTime.split(":")[0]) + Number.parseInt(startTime.split(":")[1]) / 60
    const end = Number.parseInt(endTime.split(":")[0]) + Number.parseInt(endTime.split(":")[1]) / 60
    const top = (start - 8) * 80 // 80px per hour
    const height = (end - start) * 80
    return { top: `${top}px`, height: `${height}px` }
  }

  // Mini calendar calculation
  const getMiniCalendarDays = () => {
    const year = miniCalendarDate.getFullYear()
    const month = miniCalendarDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const days = []
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const miniCalendarDays = getMiniCalendarDays()
  const today = new Date()

  // Sample my calendars
  const myCalendars = [
    { name: "My Calendar", color: "bg-blue-500" },
    { name: "Work", color: "bg-green-500" },
    { name: "Personal", color: "bg-purple-500" },
    { name: "Family", color: "bg-orange-500" },
  ]

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
    // Here you would typically also control the actual audio playback
  }

  // Show loading screen while checking authentication
  if (status === "loading" || eventsLoading) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
        <Image
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
          alt="Beautiful mountain landscape"
          fill
          className="object-cover"
          priority
        />
        <div className="relative z-10 text-white text-2xl font-semibold">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
        alt="Beautiful mountain landscape"
        fill
        className="object-cover"
        priority
      />

      {/* Navigation */}
      <header
        className={`absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-6 opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center gap-4">
          <Menu className="h-6 w-6 text-white" />
          <span className="text-2xl font-semibold text-white drop-shadow-lg">Calendar</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
            <input
              type="text"
              placeholder="Search"
              className="rounded-full bg-white/10 backdrop-blur-sm pl-10 pr-4 py-2 text-white placeholder:text-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
          <Settings className="h-6 w-6 text-white drop-shadow-md cursor-pointer" />
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            title="로그아웃"
          >
            <LogOut className="h-5 w-5 text-white" />
            <span className="text-white text-sm font-medium">로그아웃</span>
          </button>
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-md">
            {session?.user?.name?.charAt(0).toUpperCase() || session?.user?.email?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative h-screen w-full pt-20 flex">
        {/* Sidebar */}
        <div
          className={`w-64 h-full bg-white/10 backdrop-blur-lg p-4 shadow-xl border-r border-white/20 rounded-tr-3xl opacity-0 ${isLoaded ? "animate-fade-in" : ""} flex flex-col justify-between`}
          style={{ animationDelay: "0.4s" }}
        >
          <div>
            <button
              className="mb-6 flex items-center justify-center gap-2 rounded-full bg-blue-500 px-4 py-3 text-white w-full hover:bg-blue-600 transition-colors"
              onClick={() => {
                setNewEvent({
                  title: "",
                  startTime: "09:00",
                  endTime: "10:00",
                  description: "",
                  location: "",
                  date: new Date(),
                  color: "bg-blue-500",
                })
                setShowAddEventDialog(true)
              }}
            >
              <Plus className="h-5 w-5" />
              <span>Create</span>
            </button>

            {/* Mini Calendar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">{formatMonthYear(miniCalendarDate)}</h3>
                <div className="flex gap-1">
                  <button className="p-1 rounded-full hover:bg-white/20" onClick={goToPreviousMonth}>
                    <ChevronLeft className="h-4 w-4 text-white" />
                  </button>
                  <button className="p-1 rounded-full hover:bg-white/20" onClick={goToNextMonth}>
                    <ChevronRight className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                  <div key={i} className="text-xs text-white/70 font-medium py-1">
                    {day}
                  </div>
                ))}

                {miniCalendarDays.map((day, i) => {
                  const isToday =
                    day &&
                    day === today.getDate() &&
                    miniCalendarDate.getMonth() === today.getMonth() &&
                    miniCalendarDate.getFullYear() === today.getFullYear()
                  return (
                    <div
                      key={i}
                      className={`text-xs rounded-full w-7 h-7 flex items-center justify-center cursor-pointer transition-colors ${
                        isToday
                          ? "bg-blue-500 text-white"
                          : day
                            ? "text-white hover:bg-white/20"
                            : "invisible"
                      }`}
                      onClick={() => day && handleMiniCalendarDayClick(day)}
                    >
                      {day}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* My Calendars */}
            <div>
              <h3 className="text-white font-medium mb-3">My calendars</h3>
              <div className="space-y-2">
                {myCalendars.map((cal, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-sm ${cal.color}`}></div>
                    <span className="text-white text-sm">{cal.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* New position for the big plus button */}
          <button
            className="mt-6 flex items-center justify-center gap-2 rounded-full bg-blue-500 p-4 text-white w-14 h-14 self-start hover:bg-blue-600 transition-colors"
            onClick={() => {
              setNewEvent({
                title: "",
                startTime: "09:00",
                endTime: "10:00",
                description: "",
                location: "",
                date: new Date(),
                color: "bg-blue-500",
              })
              setShowAddEventDialog(true)
            }}
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>

        {/* Calendar View */}
        <div
          className={`flex-1 flex flex-col opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "0.6s" }}
        >
          {/* Calendar Controls */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors" onClick={goToToday}>
                Today
              </button>
              <div className="flex">
                <button className="p-2 text-white hover:bg-white/10 rounded-l-md" onClick={handlePrevious}>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button className="p-2 text-white hover:bg-white/10 rounded-r-md" onClick={handleNext}>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <h2 className="text-xl font-semibold text-white">{getCurrentDisplayDate()}</h2>
            </div>

            <div className="flex items-center gap-2 rounded-md p-1">
              <button
                onClick={() => setCurrentView("day")}
                className={`px-3 py-1 rounded ${currentView === "day" ? "bg-white/20" : ""} text-white text-sm`}
              >
                Day
              </button>
              <button
                onClick={() => setCurrentView("week")}
                className={`px-3 py-1 rounded ${currentView === "week" ? "bg-white/20" : ""} text-white text-sm`}
              >
                Week
              </button>
              <button
                onClick={() => setCurrentView("month")}
                className={`px-3 py-1 rounded ${currentView === "month" ? "bg-white/20" : ""} text-white text-sm`}
              >
                Month
              </button>
            </div>
          </div>

          {/* Day View */}
          {currentView === "day" && (
            <div className="flex-1 overflow-auto p-4">
              <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl h-full">
                {/* Day Header */}
                <div className="border-b border-white/20 p-4 text-center">
                  <div className="text-sm text-white/70 font-medium">
                    {weekDays[currentDayDate.getDay()]}
                  </div>
                  <div className="text-2xl font-bold text-white mt-1">{currentDayDate.getDate()}</div>
                </div>

                {/* Time Grid */}
                <div className="grid grid-cols-1">
                  <div className="relative">
                    {timeSlots.map((time, i) => (
                      <div key={i} className="flex border-b border-white/10">
                        <div className="w-20 text-white/70 p-2 text-right text-xs">
                          {time > 12 ? `${time - 12} PM` : `${time} AM`}
                        </div>
                        <div
                          className="flex-1 h-20 cursor-pointer hover:bg-white/5 transition-colors relative"
                          onClick={() =>
                            handleTimeSlotClick(
                              0,
                              time,
                            )
                          }
                        ></div>
                      </div>
                    ))}

                    {/* Events for Day */}
                    <div className="absolute top-0 left-20 right-0 bottom-0">
                      {events
                        .filter((event) => isSameDay(event.date, currentDayDate))
                        .map((event, i) => {
                          const eventStyle = calculateEventStyle(event.startTime, event.endTime)
                          return (
                            <div
                              key={i}
                              className={`absolute ${event.color} rounded-md p-2 text-white text-xs shadow-md cursor-pointer transition-all duration-200 ease-in-out hover:translate-y-[-2px] hover:shadow-lg`}
                              style={{
                                ...eventStyle,
                                left: "8px",
                                right: "8px",
                              }}
                              onClick={() => handleEventClick(event)}
                            >
                              <div className="font-medium">{event.title}</div>
                              <div className="opacity-80 text-[10px] mt-1">{`${event.startTime} - ${event.endTime}`}</div>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Week View */}
          {currentView === "week" && (
            <div className="flex-1 overflow-auto p-4">
              <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl h-full">
              {/* Week Header */}
              <div className="grid grid-cols-8 border-b border-white/20">
                <div className="p-2 text-center text-white/50 text-xs"></div>
                {weekDays.map((day, i) => {
                  const date = weekDates[i]
                  const isToday = isSameDay(date, today)
                  return (
                    <div key={i} className="p-2 text-center border-l border-white/20">
                      <div className="text-xs text-white/70 font-medium">{day}</div>
                      <div
                        className={`text-lg font-medium mt-1 text-white ${isToday ? "bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center mx-auto" : ""}`}
                      >
                        {date.getDate()}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Time Grid */}
              <div className="grid grid-cols-8">
                {/* Time Labels */}
                <div className="text-white/70">
                  {timeSlots.map((time, i) => (
                    <div key={i} className="h-20 border-b border-white/10 pr-2 text-right text-xs">
                      {time > 12 ? `${time - 12} PM` : `${time} AM`}
                    </div>
                  ))}
                </div>

                {/* Days Columns */}
                {Array.from({ length: 7 }).map((_, dayIndex) => (
                  <div key={dayIndex} className="border-l border-white/20 relative">
                    {timeSlots.map((timeSlot, timeIndex) => (
                      <div
                        key={timeIndex}
                        className="h-20 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={() => handleTimeSlotClick(dayIndex, timeSlot)}
                      ></div>
                    ))}

                    {/* Events */}
                    {events
                      .filter((event) => isSameDay(event.date, weekDates[dayIndex]))
                      .map((event, i) => {
                        const eventStyle = calculateEventStyle(event.startTime, event.endTime)
                        return (
                          <div
                            key={i}
                            className={`absolute ${event.color} rounded-md p-2 text-white text-xs shadow-md cursor-pointer transition-all duration-200 ease-in-out hover:translate-y-[-2px] hover:shadow-lg`}
                            style={{
                              ...eventStyle,
                              left: "4px",
                              right: "4px",
                            }}
                            onClick={() => handleEventClick(event)}
                          >
                            <div className="font-medium">{event.title}</div>
                            <div className="opacity-80 text-[10px] mt-1">{`${event.startTime} - ${event.endTime}`}</div>
                          </div>
                        )
                      })}
                  </div>
                ))}
              </div>
            </div>
          </div>
          )}

          {/* Month View */}
          {currentView === "month" && (
            <div className="flex-1 overflow-auto p-4">
              <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl h-full p-4">
                {/* Month Header */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day, i) => (
                    <div key={i} className="text-center text-white/70 font-medium text-sm py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Month Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {getMonthCalendarDays().map((date, i) => {
                    const isToday = date && isSameDay(date, today)
                    const dayEvents = date ? events.filter((event) => isSameDay(event.date, date)) : []

                    return (
                      <div
                        key={i}
                        className={`min-h-[100px] rounded-lg border border-white/20 p-2 ${
                          date ? "bg-white/5 cursor-pointer hover:bg-white/10" : "bg-transparent"
                        } transition-colors`}
                        onClick={() => {
                          if (date) {
                            setCurrentDayDate(date)
                            setCurrentView("day")
                          }
                        }}
                      >
                        {date && (
                          <>
                            <div
                              className={`text-sm font-medium mb-1 ${
                                isToday
                                  ? "bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                  : "text-white"
                              }`}
                            >
                              {date.getDate()}
                            </div>
                            <div className="space-y-1">
                              {dayEvents.slice(0, 3).map((event, idx) => (
                                <div
                                  key={idx}
                                  className={`${event.color} text-white text-[10px] rounded px-1 py-0.5 truncate`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEventClick(event)
                                  }}
                                >
                                  {event.title}
                                </div>
                              ))}
                              {dayEvents.length > 3 && (
                                <div className="text-white/70 text-[10px]">+{dayEvents.length - 3} more</div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Popup */}
        {showAIPopup && (
          <div className="fixed bottom-8 right-8 z-20">
            <div className="w-[450px] relative bg-gradient-to-br from-blue-400/30 via-blue-500/30 to-blue-600/30 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-blue-300/30 text-white">
              <button
                onClick={() => setShowAIPopup(false)}
                className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-blue-300" />
                </div>
                <div className="min-h-[80px]">
                  <p className="text-base font-light">{typedText}</p>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={togglePlay}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors font-medium"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowAIPopup(false)}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors font-medium"
                >
                  No
                </button>
              </div>
              {isPlaying && (
                <div className="mt-4 flex items-center justify-between">
                  <button
                    className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-white text-sm hover:bg-white/20 transition-colors"
                    onClick={togglePlay}
                  >
                    <Pause className="h-4 w-4" />
                    <span>Pause Hans Zimmer</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${selectedEvent.color} p-6 rounded-lg shadow-xl max-w-md w-full mx-4`}>
              <h3 className="text-2xl font-bold mb-4 text-white">{selectedEvent.title}</h3>
              <div className="space-y-3 text-white">
                <p className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  {`${selectedEvent.startTime} - ${selectedEvent.endTime}`}
                </p>
                <p className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  {selectedEvent.location}
                </p>
                <p className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  {formatDate(selectedEvent.date)}
                </p>
                <p className="flex items-start">
                  <Users className="mr-2 h-5 w-5 mt-1" />
                  <span>
                    <strong>Attendees:</strong>
                    <br />
                    {selectedEvent.attendees.join(", ") || "No attendees"}
                  </span>
                </p>
                <p>
                  <strong>Organizer:</strong> {selectedEvent.organizer}
                </p>
                <p>
                  <strong>Description:</strong> {selectedEvent.description}
                </p>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                >
                  삭제
                </button>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  onClick={() => handleEditEvent(selectedEvent)}
                >
                  수정
                </button>
                <button
                  className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                  onClick={() => setSelectedEvent(null)}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Event Dialog */}
        {showAddEventDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white/95 backdrop-blur-lg p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">
                {isEditMode ? "이벤트 수정" : "새 이벤트 추가"}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="이벤트 제목을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newEvent.date.toISOString().split("T")[0]}
                    onChange={(e) => setNewEvent({ ...newEvent, date: new Date(e.target.value) })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">시작 시간</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">종료 시간</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">위치</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="예: 회의실 A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="이벤트에 대한 설명을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">색상</label>
                  <div className="flex gap-2">
                    {[
                      "bg-blue-500",
                      "bg-green-500",
                      "bg-purple-500",
                      "bg-yellow-500",
                      "bg-pink-500",
                      "bg-red-500",
                      "bg-indigo-500",
                      "bg-teal-500",
                    ].map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full ${color} ${
                          newEvent.color === color ? "ring-2 ring-offset-2 ring-gray-700" : ""
                        }`}
                        onClick={() => setNewEvent({ ...newEvent, color })}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  onClick={handleCloseDialog}
                >
                  취소
                </button>
                <button
                  className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
                  onClick={handleSaveEvent}
                >
                  {isEditMode ? "수정" : "저장"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Action Button - Removed */}
      </main>
    </div>
  )
}
