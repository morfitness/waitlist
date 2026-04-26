'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion'
import { ChevronRight, Mail, Users, Target, Zap, CheckCircle, ArrowRight, Menu, X, LucideMoveRight } from 'lucide-react'
import { clsx } from 'clsx'
import { joinWaitlist } from './actions/waitlist'
import Script from 'next/script'

// Feature Card Component with scroll detection
const FeatureCard = ({ index,  image, singleImage = true, title, description, setActiveFeature }: {
  index: number
  image: string | string[]
  singleImage?: boolean,
  title?: string,
  description?: string,
  setActiveFeature: (index: number) => void
}) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { amount: 0.6 })

  useEffect(() => {
    if (isInView) {
      setActiveFeature(index)
    }
  }, [isInView, index, setActiveFeature])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 54 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.5 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-2xl h-[360px] md:h-[600px] flex items-center justify-center md:shadow-sm p-4"
      style={{ zIndex: 10 + index }}
    >
      <div className="text-center w-full h-full flex flex-col items-center justify-center md:flex-row">
        <h3 className="text-2xl leading-tight font-regular text-[#101010] md:hidden">{title}</h3>
        <p className="text-[#5C5C5C] text-sm leading-relaxed md:hidden mb-4">{description}</p>
        
        {singleImage ? (
          <img
            src={`/images/${image}.svg`}
            alt={`feature${index}`}
            className="w-[98%] md:w-[96%] h-full object-contain"
          />) : (
          <div className="flex justify-center items-center w-full h-full">
            {Array.isArray(image) && image.map((img, idx) => (
              <img
                key={idx}
                src={`/images/${img}.png`}
                alt={`feature${index}-${idx}`}
                className="w-[70%] md:w-[48%] h-full object-contain"
              />
            ))}
          </div>
         )}
      </div>
    </motion.div>
  )
}

const WaitlistLanding = () => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  
  // Use refs to avoid stale closure issues
  const lastScrollYRef = useRef(0)
  const isHeaderVisibleRef = useRef(true)
  
  // Smooth scroll dampening for heavy drag effect
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const targetScrollY = useRef(0)
  const currentScrollY = useRef(0)
  const rafId = useRef<number | null>(null)
  
  // Horizontal scroll container ref
  const horizontalRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const [maxScroll, setMaxScroll] = useState(0)
  
  const { scrollYProgress } = useScroll({
    target: horizontalRef,
    container: scrollContainerRef,
    offset: ["start start", "end end"]
  })
  
  // Calculate max scroll distance dynamically
  useEffect(() => {
    const calculateMaxScroll = () => {
      if (cardsRef.current) {
        const scrollWidth = cardsRef.current.scrollWidth
        const viewportWidth = window.innerWidth
        setMaxScroll(-(scrollWidth - viewportWidth))
      }
    }

    calculateMaxScroll()
    // Recalculate after a tick to catch post-layout sizing (images, fonts)
    const t = setTimeout(calculateMaxScroll, 300)
    window.addEventListener('resize', calculateMaxScroll)

    // Observe size changes of the cards container
    let ro: ResizeObserver | null = null
    if (cardsRef.current && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(calculateMaxScroll)
      ro.observe(cardsRef.current)
    }

    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', calculateMaxScroll)
      ro?.disconnect()
    }
  }, [])
  
  // Transform scroll progress to horizontal movement using actual dimensions
  const x = useTransform(scrollYProgress, [0, 1], [0, maxScroll])
  
  // Handle scroll behavior for header
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Clear existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }

      // Always show header at the top
      if (currentScrollY < 50) {
        setIsHeaderVisible(true)
        isHeaderVisibleRef.current = true
      }
      // Hide header when scrolling down (after 100px and not at top)
      else if (currentScrollY > 100 && currentScrollY > lastScrollYRef.current) {
        setIsHeaderVisible(false)
        isHeaderVisibleRef.current = false
      }
      // Show header when scrolling up
      else if (currentScrollY < lastScrollYRef.current) {
        setIsHeaderVisible(true)
        isHeaderVisibleRef.current = true
      }

      // Show header when user stops scrolling
      scrollTimeout = setTimeout(() => {
        setIsHeaderVisible(true)
        isHeaderVisibleRef.current = true
      }, 1500) // Show after 1.5 seconds of inactivity

      // Update refs
      lastScrollYRef.current = currentScrollY
      setLastScrollY(currentScrollY)
    }

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
    }
  }, []) // Remove dependencies to avoid re-running

  // Smooth scroll dampening effect for heavy drag
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    // Initialize scroll position
    currentScrollY.current = container.scrollTop
    targetScrollY.current = container.scrollTop

    const dampingFactor = 0.08 // Lower = slower/heavier drag (0.05-0.15 range)
    
    const smoothScroll = () => {
      // Lerp (linear interpolation) for smooth dampening
      currentScrollY.current += (targetScrollY.current - currentScrollY.current) * dampingFactor
      
      // Apply the scroll
      container.scrollTop = currentScrollY.current
      
      // Continue animation if not close enough to target
      if (Math.abs(targetScrollY.current - currentScrollY.current) > 0.5) {
        rafId.current = requestAnimationFrame(smoothScroll)
      } else {
        rafId.current = null
      }
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      // Accumulate scroll delta (works for both up and down)
      targetScrollY.current += e.deltaY
      // Clamp to valid scroll range
      targetScrollY.current = Math.max(0, Math.min(targetScrollY.current, container.scrollHeight - container.clientHeight))
      
      // Start smooth scroll animation if not already running
      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(smoothScroll)
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      container.removeEventListener('wheel', handleWheel)
      if (rafId.current) {
        cancelAnimationFrame(rafId.current)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const result = await joinWaitlist(email)
      
      if (result.success) {
        setIsSubmitted(true)
        setEmail('')
      } else {
        setError(result.error || 'Something went wrong. Please try again.')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className=''>
      <div 
        ref={scrollContainerRef}
        className="h-screen overflow-y-scroll"
        style={{ scrollBehavior: 'auto' }}
      >
        {/* Smart Navigation Header */}
        <AnimatePresence>
          <motion.nav 
            className={clsx(
              "fixed top-0 left-0 right-0 z-[100]",
              "transition-transform duration-300 ease-in-out"
            )}
            style={{
              transform: isHeaderVisible ? 'translateY(0)' : 'translateY(-100%)'
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-4 md:px-6 pb-3  md:py-4 md:bg-black/0">
              <div className="flex items-center justify-between ">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-2"
                >
                  <img 
                    src='/images/Logo2.svg'
                    className='scale-75 md:scale-100'
                  />
                </motion.div>
                
                {/* Desktop Navigation */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setIsModalOpen(true)}
                  className="flex cursor-pointer transform items-center space-x-2 text-black bg-white py-2 md:py-3 px-3  md:px-6 shadow-lg rounded-full hover:bg-black hover:text-white"
                >
                    <span className="rounded-lg text-sm md:text-base font-medium  transition">Join Waitlist</span>
                    <LucideMoveRight size={14}/>
                </motion.div>

                {/* Mobile Menu Button */}
                {/* <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6 text-white" />
                  ) : (
                    <Menu className="w-6 h-6 text-white" />
                  )}
                </motion.button> */}
              </div>

              {/* Mobile Menu */}
              {/* <AnimatePresence>
                {isMobileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -20, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="md:hidden mt-4 pt-4 border-t border-dark-700 "
                  >
                    <div className="flex flex-col space-y-4">
                      <a 
                        href="#features" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-gray-300 hover:text-white transition py-2"
                      >
                        Features
                      </a>
                      <a 
                        href="#how-it-works" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-gray-300 hover:text-white transition py-2"
                      >
                        How It Works
                      </a>
                      <button 
                        onClick={() => { setIsMobileMenuOpen(false); setIsModalOpen(true) }}
                        className="bg-primary-500 hover:bg-primary-600 px-4 py-2 rounded-lg transition text-center"
                      >
                        Join Waitlist
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence> */}
            </div>
          </motion.nav>
        </AnimatePresence>

        {/* Hero Section - Card 1 */}
        <section className="h-screen bg-black w-full sticky top-0 overflow-hidden">
          {/* Background Image */}
          <motion.div 
            className="absolute inset-0"
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <img 
              src="/images/hero.svg" 
              alt="Hero Background"
              className="w-full h-full object-cover object-top scale-90 rounded-2xl"
            />
            {/* Overlay for better text readability - bottom left gradient */}
          </motion.div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-end pb-16 md:pb-20">
            <div className="container mx-auto px-6 md:px-12 max-w-7xl">
              <div className="max-w-2xl">
                <motion.h1 
                  className="text-5xl md:text-[60px] text-white font-normal"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                >
                  Eat Smarter. Reach Your Body Goals Faster
                </motion.h1>
                <motion.p 
                  className="text-lg mt-2 md:text-xl text-white/90 leading-relaxed"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                >
                  A smarter way to plan meals and reach your fitness goals
                </motion.p>
                {/* <motion.a
                  href="#waitlist"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block bg-white text-black px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition"
                >
                  Join waitlist
                </motion.a> */}
              </div>
            </div>
          </div>
        </section>
        {/* Parallax Sticky Notes Section - Card 3 */}
        <div className='min-h-screen sticky z-20 px-2 md:px-6 '>
          <div className='w-full h-full bg-[#FFF7EF] text-[#101010] rounded-3xl shadow-2xl overflow-y-auto py-10 md:py-16'>
            <div className='text-center max-w-2xl mx-auto'>
              <h3 className='font-normal text-4xl md:text-[72px] capitalize leading-tight md:leading-[69px] px-4 md:px-0'>Eating right shouldn't be a struggle</h3>
                <p className='max-w-3xl text-[#5C5C5C] mt-3 font-medium text-base md:text-lg leading-relaxed md:leading-[32px] px-4 md:px-0'>Finally a meal planner that actually understands you and your goals</p>
            </div>
            <section className=''>
              {/* Sticky container - stays in viewport while scrolling through section */}
              <div className="sticky top-0 md:h-screen flex items-center justify-center md:overflow-hidden">
                <div className="relative w-full mx-auto px-6 max-w-screen-xl">
                  {/* Single row of overlapping sticky notes */}
                  <div className="relative flex justify-center items-end h-[500px] scale-100 sm:scale-75 md:scale-100 origin-center">
                    
                    {/* Note 1 - Tilted right at top (top-right corner touches Note 2) */}
                    <motion.div
                      className="absolute scale-75 duration-500 left-[8%] hover:scale-90 md:hover:scale-105 transition-transform hover:z-50 group"
                    >
                      <div className="relative rotate-[18deg] group-hover:rotate-0 transition-transform duration-300">
                        {/* Paper Clip Pin */}
                        <div className="absolute -top-8 left-8 transform -rotate-[30deg] -translate-x-1/2 z-30">
                          <svg width="50" height="60" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 10 Q10 10 10 15 L10 35 Q10 42 17 42 Q24 42 24 35 L24 20 Q24 16 20 16 Q16 16 16 20 L16 32" 
                                  stroke="#6B7280" strokeWidth="3" strokeLinecap="round" fill="none"/>
                          </svg>
                        </div>
                        {/* Sticky Note Image */}
                        <img 
                          src="/images/sticky4.svg" 
                          alt="Generic Diet Plans Don't Work For You" 
                          className="w-80 h-auto rounded-sm shadow-2xl"
                        />
                      </div>
                    </motion.div>

                    {/* Note 2 - Tilted left at top (top-left corner touches Note 1, top-right touches Note 3) */}
                    <motion.div
                      className="absolute left-[30%] scale-75 duration-500 hover:scale-105 transition-transform hover:z-50 group"
                    >
                      <div className="relative -rotate-[12deg] group-hover:rotate-0 transition-transform duration-300">
                        {/* Paper Clip Pin */}
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-30">
                          <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 10 Q10 10 10 15 L10 35 Q10 42 17 42 Q24 42 24 35 L24 20 Q24 16 20 16 Q16 16 16 20 L16 32" 
                                  stroke="#6B7280" strokeWidth="3" strokeLinecap="round" fill="none"/>
                          </svg>
                        </div>
                        {/* Sticky Note Image */}
                        <img 
                          src="/images/sticky1.svg" 
                          alt="Tracking Meals Is Time Consuming" 
                          className="w-80 h-auto rounded-sm shadow-2xl"
                        />
                      </div>
                    </motion.div>

                    {/* Note 3 - Tilted right at top (top-left touches Note 2, top-right touches Note 4) */}
                    <motion.div
                      className="absolute left-[52%]  scale-75 duration-500 hover:scale-105 transition-transform hover:z-50 group"
                    >
                      <div className="relative rotate-[20deg] group-hover:rotate-0 transition-transform duration-300">
                        {/* Paper Clip Pin */}
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-30">
                          <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 10 Q10 10 10 15 L10 35 Q10 42 17 42 Q24 42 24 35 L24 20 Q24 16 20 16 Q16 16 16 20 L16 32" 
                                  stroke="#6B7280" strokeWidth="3" strokeLinecap="round" fill="none"/>
                          </svg>
                        </div>
                        {/* Sticky Note Image */}
                        <img 
                          src="/images/sticky2.svg" 
                          alt="Calories And Macros Are Confusing" 
                          className="w-80 h-auto rounded-sm shadow-2xl"
                        />
                      </div>
                    </motion.div>

                    {/* Note 4 - Tilted left at top (top-left touches Note 3) */}
                    <motion.div
                      className="absolute left-[74%]  scale-75 duration-500 hover:scale-125 md:hover:scale-105 transition-transform hover:z-50 group"
                    >
                      <div className="relative -rotate-[10deg] group-hover:rotate-0 transition-transform duration-300">
                        {/* Paper Clip Pin */}
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-30">
                          <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 10 Q10 10 10 15 L10 35 Q10 42 17 42 Q24 42 24 35 L24 20 Q24 16 20 16 Q16 16 16 20 L16 32" 
                                  stroke="#6B7280" strokeWidth="3" strokeLinecap="round" fill="none"/>
                          </svg>
                        </div>
                        {/* Sticky Note Image */}
                        <img 
                          src="/images/sticky3.svg" 
                          alt="You Don't Know What To Eat For Your Goals" 
                          className="w-80 h-auto rounded-sm shadow-2xl"
                        />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

          {/* Waitlist Form Section - Card 4 */}
        <section id="waitlist" className="md:min-h-screen sticky top-10 z-30">
          <div className="w-full h-full rounded-none md:rounded-tl-3xl md:rounded-tr-3xl overflow-y-auto">
            <div className="">
              <img 
                src="/images/morfit.svg" 
                alt="Logo" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* Interactive Feature Showcase Section */}
        <motion.section 
          className="min-h-screen px-2 md:px-6  text-gray-900 py-20 relative z-40 transition-colors duration-700"
          animate={{
            backgroundColor: 
              activeFeature === 0 ? '#FEF3F2' : // Light purple/pink
              activeFeature === 1 ? '#EFF6FF' : // Light blue
              activeFeature === 2 ? '#F0FDF4' : // Light green
              '#FFF7ED' // Light orange
          }}
        >
          <div className="mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-12 items-start">
              
              {/* Left Side - Fixed Text & Button (sticky on both mobile and desktop) */}
              <div className="sticky hidden md:block top-20 md:top-32 z-10 space-y-4 md:space-y-6 md:col-span-2 bg-transparent backdrop-blur-sm md:backdrop-blur-0 py-3 md:py-0 -mx-6 px-6 md:mx-0 md:px-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3 md:space-y-6"
                  >
                    <h2 className="text-2xl md:text-[52px] leading-tight md:leading-[56px] font-regular text-[#101010] max-w-md">
                      {activeFeature === 0 && "Meal plans built for you"}
                      {activeFeature === 1 && "Scan any meal and know exactly what's inside"}
                      {activeFeature === 2 && "Understand what you eat"}
                      {activeFeature === 3 && "Track progress without the stress"}
                    </h2>
                    <p className="max-w-3xl text-[#5C5C5C] text-sm md:text-lg leading-relaxed md:leading-[32px] hidden md:block">
                      {activeFeature === 0 && "Personalized daily and weekly meal plans based on your body, goals and preferences"}
                      {activeFeature === 1 && "Snap a photo and instantly get calories, protein, carbs, fats and more"}
                      {activeFeature === 2 && "Break down every meal and learn how it affects your progress"}
                      {activeFeature === 3 && "A smarter way to plan meals, understand food and stay consistent without the guesswork"}
                    </p>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsModalOpen(true)}
                      className="hidden md:flex bg-black text-white rounded-full font-medium px-8 py-4 transition items-center space-x-2"
                    >
                      <span>Join waitlist</span>
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right Side - Stacking Cards */}
              <div className="space-y-16 md:space-y-16 md:col-span-3">
                {/* Card 1 */}
                <FeatureCard 
                  index={0}
                  image='feature1'
                  setActiveFeature={setActiveFeature}
                  title='Meal plans built for you'
                  description='Personalized daily and weekly meal plans based on your body, goals and preferences'
                />

                {/* Card 2 */}
                <FeatureCard 
                  index={1}
                  image='feature2'
                  setActiveFeature={setActiveFeature}
                  title="Scan any meal and know exactly what's inside"
                  description="Snap a photo and instantly get calories, protein, carbs, fats and more."
                />

                {/* Card 3 */}
                <FeatureCard 
                  index={2}
                  image={['feature31', 'feature32']}
                  singleImage={false}
                  setActiveFeature={setActiveFeature}
                  title='Understand what you eat'
                  description='Break down every meal and learn how it affects your progress'
                />

                {/* Card 4 */}
                <FeatureCard 
                  index={3}
                  image='feature4'
                  setActiveFeature={setActiveFeature}
                  title='Track progress without the stress'
                  description='A smarter way to plan meals, understand food and stay consistent without the guesswork'
                />
              </div>

            </div>
          </div>
        </motion.section>
        
        {/* Horizontal Parallax Scroll Section */}
        <div ref={horizontalRef} className='h-[150vh] md:h-[500vh] bg-white relative z-50'>
          <div className="sticky top-0 h-screen overflow-hidden flex items-end md:items-center pb-8 md:pb-0">
            <motion.div 
              ref={cardsRef}
              style={{ x }}
              className="flex gap-2 md:gap-4 pl-4 md:pl-6"
            >
              {/* Weight Gain Card */}
              <div className="min-w-[85vw] h-[65vh] md:min-w-[40vw] md:h-[85vh] flex-shrink-0 flex items-center justify-center min-h-0">
                <img 
                  src="/images/weight1.svg" 
                  alt="Weight Gain"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Weight Loss Card */}
              <div className="min-w-[85vw] h-[65vh] md:min-w-[40vw] md:h-[85vh] flex-shrink-0 flex items-center justify-center min-h-0">
                <img 
                  src="/images/weight2.svg" 
                  alt="Weight Loss"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Fitness Beginners Card */}
              <div className="min-w-[85vw] h-[65vh] md:min-w-[40vw] md:h-[85vh] flex-shrink-0 flex items-center justify-center min-h-0">
                <img 
                  src="/images/weight3.svg" 
                  alt="Fitness Beginners"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Busy Professionals Card */}
              <div className="min-w-[85vw] h-[65vh] md:min-w-[40vw] md:h-[85vh] flex-shrink-0 flex items-center justify-center min-h-0">
                <img 
                  src="/images/weight4.svg" 
                  alt="Busy Professionals"
                  className="w-full h-full object-contain"
                />
              </div>
            </motion.div>
          </div>
        </div>

        <section id="waitlist" className="h-screen px-2 md:px-6 relative z-30 bg-gradient-to-b from-white via-white to-dark-900">
          <div className="w-full h-full flex items-center justify-center">
            <div className="relative container mx-auto px-6 py-20">
              <img
                src='/images/vege.svg'
                alt="vegetables"
                className='block absolute bottom-0 left-0 w-40 md:w-64 lg:w-auto'
              />

              <img
                src='/images/vege.svg'
                alt="vegetables"
                className='block absolute bg-blend-lighten md:-top-10 right-0 scale-75 w-36 md:w-64 lg:w-auto'
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-3xl mx-auto text-[#101010] relative z-[30]"
              >
                  <p className='text-center font-normal text-4xl md:text-[72px] leading-tight md:leading-[69px] mb-4'>Join hundreds of early users on the waitlist</p>
                  <p className='text-center text-[#5C5C5C] font-medium text-base md:text-lg leading-relaxed md:leading-[32px] mx-auto max-w-2xl'>Join the waitlist and be the first to experience a better way to eat</p>
                  <div className='flex justify-center mt-10'>
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => setIsModalOpen(true)}
                      className="w-max flex cursor-pointer transform items-center space-x-2 py-3 px-6 rounded-full bg-black text-white text-sm md:text-base"
                    >
                        <span className="rounded-lg transition">Join Waitlist</span>
                        <LucideMoveRight size={14}/>
                    </motion.div>
                  </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="top-0 z-50 sticky bg-dark-900">
          <div className="container mx-auto px-6 py-10 md:py-20">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <img
                  src='/images/Logo2.svg'
                  className='w-24 scale-75 md:scale-90'
                />
                <div className="text-xl md:text-2xl font-bold">Morfit</div>
              </div>
              
              <div className="flex items-center space-x-6 text-gray-400 text-sm">
                <span>© 2026 Morfit. All rights reserved.</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Waitlist Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              if (!isSubmitting) {
                setIsModalOpen(false)
                setTimeout(() => { setIsSubmitted(false); setError('') }, 300)
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xl md:max-w-2xl bg-white rounded-[28px] shadow-2xl overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  if (!isSubmitting) {
                    setIsModalOpen(false)
                    setTimeout(() => { setIsSubmitted(false); setError('') }, 300)
                  }
                }}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition z-10"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {isSubmitted ? (
                /* Success State */
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-10 text-center"
                  id="success-message"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                    className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center"
                  >
                    <CheckCircle className="w-9 h-9 text-green-600" />
                  </motion.div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">You're on the list!</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Thanks for joining. We'll email you as soon as Morfit is ready for early access.
                  </p>
                  <button
                    onClick={() => {
                      setIsModalOpen(false)
                      setTimeout(() => setIsSubmitted(false), 300)
                    }}
                    className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition"
                  >
                    Done
                  </button>
                </motion.div>
              ) : (
                /* Form State - Branded Design */
                <div className="relative bg-[#FFF7EF] overflow-hidden">
                  {/* Decorative vege image bottom-right */}
                  <img
                    src="/images/vege.svg"
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-10 -right-10 w-72 opacity-90 select-none"
                  />

                  {/* Floating sticky note decorations */}
                  <motion.img
                    src="/images/sticky1.svg"
                    alt=""
                    aria-hidden="true"
                    initial={{ rotate: -8, y: 10, opacity: 0 }}
                    animate={{ rotate: -8, y: 0, opacity: 1 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 18 }}
                    className="pointer-events-none absolute -top-6 -left-6 w-28 select-none drop-shadow-xl"
                  />
                  <motion.img
                    src="/images/sticky3.svg"
                    alt=""
                    aria-hidden="true"
                    initial={{ rotate: 12, y: 10, opacity: 0 }}
                    animate={{ rotate: 12, y: 0, opacity: 1 }}
                    transition={{ delay: 0.25, type: 'spring', stiffness: 200, damping: 18 }}
                    className="pointer-events-none absolute top-8 right-16 w-20 select-none drop-shadow-xl hidden sm:block"
                  />

                  <div className="relative p-6 md:p-12">
                    {/* Small label */}
                    <div className="inline-flex items-center gap-2 bg-black text-white px-3 py-1.5 rounded-full text-xs font-medium mb-6">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      Early access
                    </div>

                    {/* Editorial headline matching site style */}
                    <h3 className="font-normal text-[#101010] text-4xl md:text-6xl leading-[1.05] tracking-tight mb-4 max-w-md">
                      Eat smarter.<br />
                      <span className="italic text-[#5C5C5C]">Starting soon.</span>
                    </h3>

                    <p className="text-[#5C5C5C] text-base leading-relaxed mb-8 max-w-sm">
                      Join <span className="font-semibold text-[#101010]">1,247+</span> people already on the list for AI‑powered meal plans and instant food analysis.
                    </p>

                    <form className="relative max-w-md" onSubmit={handleSubmit}>
                      {/* Inline pill input with submit inside */}
                      <div className="relative flex items-center bg-white border border-[#E8E0D4] rounded-full p-1.5 shadow-sm focus-within:border-black transition">
                        <Mail className="w-4 h-4 text-[#5C5C5C] ml-4 flex-shrink-0" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="you@example.com"
                          className="flex-1 bg-transparent px-3 py-2 text-[#101010] placeholder-[#9B9B9B] focus:outline-none text-sm min-w-0"
                        />
                        <motion.button
                          type="submit"
                          disabled={isSubmitting}
                          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                          whileTap={{ scale: isSubmitting ? 1 : 0.97 }}
                          className="bg-black text-white rounded-full font-medium px-5 py-2.5 flex items-center space-x-1.5 hover:bg-[#1a1a1a] transition disabled:opacity-60 disabled:cursor-not-allowed flex-shrink-0 text-sm"
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                              </svg>
                              <span>Joining</span>
                            </>
                          ) : (
                            <>
                              <span>Join</span>
                              <LucideMoveRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </motion.button>
                      </div>

                      {/* Social proof avatars */}
                      <div className="flex items-center gap-3 mt-6">
                        <div className="flex -space-x-2">
                          {['#F4B860', '#E86F4C', '#4A7C7E', '#D4A5A5'].map((color, i) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded-full border-2 border-[#FFF7EF]"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-[#5C5C5C] leading-tight">
                          Trusted by food lovers<br />across Nigeria
                        </p>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Script>
        {`window.REQUIRED_CODE_ERROR_MESSAGE = 'Please provide a valid email address';
          window.LOCALE = 'en';
          window.EMAIL_INVALID_MESSAGE = window.SMS_INVALID_MESSAGE = "Hmm, that doesn't look right. Can you double-check it?";

          window.REQUIRED_ERROR_MESSAGE = "This field is required";

          window.GENERIC_INVALID_MESSAGE = "Hmm, that doesn't look right. Can you double-check it?";




          window.translation = {
            common: {
              selectedList: '{quantity} list selected',
              selectedLists: '{quantity} lists selected',
              selectedOption: '{quantity} selected',
              selectedOptions: '{quantity} selected',
            }
          };

          var AUTOHIDE = Boolean(0);
      `}
      </Script>
    </main>
  )
}

export default WaitlistLanding
