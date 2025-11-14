import { useState } from 'react'
import { useRouter } from 'next/router'
import EmailModal from '../components/EmailModal'

const Underline = ({ children, bold = false }) => (
  <span className="relative inline-block">
    <span>{children}</span>
    <img
      src={bold ? "/figma/about-underline-3.svg" : "/figma/about-underline-2.svg"}
      alt=""
      className={`pointer-events-none absolute ${bold ? '-bottom-2' : 'bottom-0'} left-0 w-full`}
    />
  </span>
)

const FAQButton = ({ className = "", onClick, isOpen = false }) => (
  <button
    data-layer="Primary Button"
    className={`PrimaryButton size-8 px-3 py-2 bg-pink-700 rounded-[56px] inline-flex justify-center items-center gap-2 cursor-pointer ${className}`}
    onClick={onClick}
  >
    <div data-svg-wrapper data-layer="Plus" className="Plus relative">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}
      >
        <g clipPath="url(#clip0_10364_5908)" fill="white" opacity="1">
          <path d="M7.5 12.6654V3.33203C7.5 3.05589 7.72386 2.83203 8 2.83203C8.27614 2.83203 8.5 3.05589 8.5 3.33203V12.6654C8.5 12.9415 8.27614 13.1654 8 13.1654C7.72386 13.1654 7.5 12.9415 7.5 12.6654Z" fill="white" opacity="1"/>
          <path d="M12.6668 7.5C12.943 7.5 13.1668 7.72386 13.1668 8C13.1668 8.27614 12.943 8.5 12.6668 8.5H3.3335C3.05735 8.5 2.8335 8.27614 2.8335 8C2.8335 7.72386 3.05735 7.5 3.3335 7.5H12.6668Z" fill="white" opacity="1"/>
        </g>
        <defs>
          <clipPath id="clip0_10364_5908">
            <rect width="16" height="16" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    </div>
  </button>
)

const About = () => {
  const [openFAQ, setOpenFAQ] = useState(null)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const router = useRouter()

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  const scrollToSection = (sectionId) => {
    const element = document.querySelector(`[data-layer*="${sectionId}"]`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const goToHome = () => {
    router.push('/')
  }

  const handleEmailUsClick = () => {
    setShowEmailModal(true)
  }

  return (
<div data-layer="About us" className="AboutUs w-[1440px] min-h-[6637px] relative bg-[#fff5f5] ">
  <div className="HeroHeading max-w-[1155px] left-0 right-0 top-[136px] absolute mx-auto text-center">
    <h1 className="font-['DM_Sans'] font-bold leading-tight text-[48px] md:text-[64px] text-[#10112a]">
      From cold calls to big wins — <span className="text-[#aa336a]">SalesGossip</span> is where pros
      <span className="inline-flex items-center ml-3 align-middle" aria-hidden>
        <img src="/figma/pros-1.png" alt="" className="w-10 h-10 md:w-16 md:h-16 rounded-full border-2 border-white" />
        <img src="/figma/pros-2.png" alt="" className="w-10 h-10 md:w-16 md:h-16 rounded-full border-2 border-white -ml-3 md:-ml-4" />
        <img src="/figma/pros-3.png" alt="" className="w-10 h-10 md:w-16 md:h-16 rounded-full border-2 border-white -ml-3 md:-ml-4" />
      </span>
      <br />
      share what <Underline>really&nbsp;happens</Underline> at work.
    </h1>
  </div>
  
  <img data-layer="Rectangle 61" className="Rectangle61 left-[142px] top-[424px] absolute rounded-[32px] shadow-md" src="/figma/about-story-0.jpg" alt="rectangle-hero" style={{width: '1156px', height: '650px', objectFit: 'cover', objectPosition: 'center 28%'}} />
  <div data-layer="Frame 48097084" className="Frame48097084 w-[293px] h-[216px] left-[214px] top-[496px] absolute bg-white rounded-2xl shadow-md overflow-hidden">
    <div data-layer="Frame 48097081" className="Frame48097081 size- left-[24px] top-[112px] absolute inline-flex justify-start items-center gap-2">
      <img data-layer="Flower image" className="FlowerImage size-6 rounded-full" src="/figma/comment-avatar-0.png" alt="flower" />
      <div data-layer="Username" className="Username justify-start text-[#17183b] text-base font-medium font-['Inter']">david.sdr</div>
    </div>
    <div data-layer="Line 66" className="Line66 w-[293px] h-0 left-0 top-[152px] absolute" style={{ borderTop: '2px dashed #b7b7c2', borderImage: 'repeating-linear-gradient(to right, #b7b7c2 0%, #b7b7c2 10px, transparent 10px, transparent 15px) 1' }}></div>
    <div data-svg-wrapper data-layer="Frame" className="Frame size-5 left-[24px] top-[172px] absolute">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_487_12651)">
          <path d="M16.2491 10.4771L9.99911 16.6671L3.74911 10.4771C3.33687 10.0759 3.01215 9.59374 2.7954 9.06092C2.57866 8.52811 2.47458 7.95618 2.48973 7.38117C2.50487 6.80615 2.63891 6.2405 2.88341 5.71984C3.1279 5.19917 3.47756 4.73477 3.91035 4.35587C4.34314 3.97698 4.8497 3.6918 5.39812 3.51829C5.94654 3.34479 6.52495 3.28671 7.09692 3.34773C7.66889 3.40874 8.22203 3.58752 8.72151 3.87281C9.22099 4.1581 9.65598 4.54373 9.99911 5.00539C10.3437 4.54708 10.7792 4.16483 11.2784 3.88256C11.7775 3.6003 12.3295 3.4241 12.8999 3.36499C13.4703 3.30588 14.0467 3.36514 14.5931 3.53905C15.1395 3.71296 15.6441 3.99779 16.0754 4.37569C16.5067 4.7536 16.8553 5.21646 17.0995 5.7353C17.3436 6.25414 17.4781 6.81779 17.4944 7.39098C17.5107 7.96417 17.4085 8.53455 17.1942 9.06643C16.98 9.59831 16.6582 10.0802 16.2491 10.4821" fill="#AA336A"/>
          <path d="M16.2491 10.4771L9.99911 16.6671L3.74911 10.4771C3.33687 10.0759 3.01215 9.59374 2.7954 9.06092C2.57866 8.52811 2.47458 7.95618 2.48973 7.38117C2.50487 6.80615 2.63891 6.2405 2.88341 5.71984C3.1279 5.19917 3.47756 4.73477 3.91035 4.35587C4.34314 3.97698 4.8497 3.6918 5.39812 3.51829C5.94654 3.34479 6.52495 3.28671 7.09692 3.34773C7.66889 3.40874 8.22203 3.58752 8.72151 3.87281C9.22099 4.1581 9.65599 4.54372 9.99911 5.00539C10.3437 4.54708 10.7792 4.16483 11.2784 3.88256C11.7775 3.6003 12.3295 3.4241 12.8999 3.36499C13.4703 3.30588 14.0467 3.36514 14.5931 3.53905C15.1395 3.71296 15.6441 3.99779 16.0754 4.37569C16.5067 4.7536 16.8553 5.21646 17.0995 5.7353C17.3436 6.25414 17.4781 6.81779 17.4944 7.39098C17.5107 7.96417 17.4085 8.53455 17.1942 9.06643C16.98 9.59831 16.6582 10.0802 16.2491 10.4821" stroke="#AA336A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
        <defs>
          <clipPath id="clip0_487_12651">
            <rect width="20" height="20" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    </div>
    <div data-layer="Likes text" className="LikesText left-[50px] top-[173.50px] absolute justify-start text-[#aa336a] text-sm font-medium font-['Inter']">12k</div>
    <div data-svg-wrapper data-layer="Frame" className="Frame size-5 left-[89px] top-[172px] absolute">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_487_12655)">
          <path d="M2.5 16.6674L3.58333 13.4174C1.64667 10.5532 2.395 6.85741 5.33333 4.77241C8.27167 2.68825 12.4917 2.85908 15.2042 5.17241C17.9167 7.48658 18.2833 11.2274 16.0617 13.9232C13.84 16.6191 9.71583 17.4357 6.41667 15.8341L2.5 16.6674Z" stroke="#10112A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
        <defs>
          <clipPath id="clip0_487_12655">
            <rect width="20" height="20" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    </div>
    <div data-layer="Comments count" className="CommentsCount left-[117px] top-[173.50px] absolute justify-start text-[#10112a] text-sm font-medium font-['Inter']">128</div>
    <div data-layer="Deal closed—like a shop on a Sunday! 🔒" className="DealClosedLikeAShopOnASunday w-[234px] left-[24px] top-[24px] absolute justify-start text-black text-[23px] font-medium font-['Inter']">Deal closed—like a shop on a Sunday! 🔒</div>
  </div>
  <div data-layer="Frame 48097082" className="Frame48097082 w-[273px] h-[120px] left-[993px] top-[540px] absolute bg-white rounded-2xl overflow-hidden">
    <img data-layer="Avatar" className="Avatar size-8 left-[16px] top-[16px] absolute rounded-full" src="/figma/comment-avatar-2.png" alt="avatar" />
    <div data-layer="Post text" className="PostText w-[196px] left-[60px] top-[16px] absolute justify-start"><span className="text-[#10112a] text-sm font-semibold font-['Inter'] leading-[22px]">maria.bizdev</span><span className="text-[#10112a] text-sm font-normal font-['Inter'] leading-[22px]"> </span><span className="text-[#64647c] text-sm font-normal font-['Inter'] leading-[22px]">has commented on your post: </span><span className="text-[#10112a] text-sm font-normal font-['Inter'] leading-[22px]">These are great insights—I&apos;ll definitely give this trick a try.</span></div>
  </div>
  <div data-layer="Frame 48097081" className="Frame48097081 w-[220px] h-[76px] left-[1046px] top-[456px] absolute bg-white rounded-2xl overflow-hidden">
    <img data-layer="Avatar" className="Avatar size-8 left-[16px] top-[16px] absolute rounded-full" src="/figma/comment-avatar-1.png" alt="comment-avatar-1" />
    <div data-layer="Post text" className="PostText w-36 left-[60px] top-[16px] absolute justify-start"><span className="text-[#10112a] text-sm font-semibold font-['Inter'] leading-[22px]">andrea.bdev7</span><span className="text-[#10112a] text-sm font-normal font-['Inter'] leading-[22px]"> </span><span className="text-[#64647c] text-sm font-normal font-['Inter'] leading-[22px]">has started following you</span></div>
  </div>
  <img data-layer="Rectangle 62" className="Rectangle62 size-[507px] left-[142px] top-[1365px] absolute rounded-[32px] " src="/figma/about-story-1.png" alt="rectangle-62" />
  <img data-layer="Rectangle 61" className="Rectangle61 size-[507px] left-[791px] top-[1992px] absolute rounded-[32px] " src="/figma/about-story-2.png" alt="rectangle-62" />
  <img data-layer="Rectangle 63" className="Rectangle63 size-[507px] left-[142px] top-[2619px] absolute rounded-[32px] " src="/figma/about-story-3.png" alt="rectangle-63" />
  <img data-layer="Rectangle 64" className="Rectangle64 size-[507px] left-[791px] top-[3246px] absolute rounded-[32px] " src="/figma/about-story-4.png" alt="rectangle-64" />
  <img data-layer="Rectangle 65" className="Rectangle65 size-[507px] left-[142px] top-[3873px] absolute rounded-[32px] " src="/figma/about-story-5.png" alt="rectangle-65" />
  <div data-layer="How It Works" className="HowItWorks left-[659px] top-[1210px] absolute text-center justify-start text-[#454662] text-base font-medium font-['Inter'] uppercase">How It Works</div>
  <div data-layer="Post. Tag. Gossip. Repeat." className="PostTagGossipRepeat w-[854px] left-[293px] top-[1245px] absolute text-center justify-start text-[#10112a] text-[40px] font-semibold font-['DM_Sans'] leading-[48px]">Post. Tag. Gossip. <Underline bold={true}>Repeat</Underline>.</div>
  <img data-layer="Customer Testimonial-09" className="CustomerTestimonial09 size-[304px] left-[892px] top-[1423px] absolute" src="/figma/about-story-customer-testimonial-1.png" alt="customer testimonial 1" />
  <div data-layer="Share your stories – from sales wins to workplace chaos" className="ShareYourStoriesFromSalesWinsToWorkplaceChaos w-[313px] left-[888px] top-[1759px] absolute text-center justify-start"><span className="text-[#10112a] text-xl font-semibold font-['Inter'] leading-7">Share your stories – </span><span className="text-[#10112a] text-xl font-normal font-['Inter'] leading-7">from sales wins to workplace chaos</span></div>
  <img data-layer="Customer Testimonial-05" className="CustomerTestimonial05 size-[304px] left-[893px] top-[3931px] absolute" src="/figma/about-story-customer-testimonial-5.png" alt="customer testimonial 5" />
  <div data-layer="Stay anonymous if you want – your identity, your choice" className="StayAnonymousIfYouWantYourIdentityYourChoice w-[330px] left-[880px] top-[4267px] absolute text-center justify-start"><span className="text-[#10112a] text-xl font-semibold font-['Inter'] leading-7">Stay anonymous if you want –</span><span className="text-[#10112a] text-xl font-normal font-['Inter'] leading-7"> your identity, your choice</span></div>
  <img data-layer="Customer Testimonial-03" className="CustomerTestimonial03 size-[304px] left-[243px] top-[2050px] absolute" src="/figma/about-story-customer-testimonial-2.png" alt="customer testimonial 2" />
  <div data-layer="Discover real experiences – using tags, topics, and company mentions" className="DiscoverRealExperiencesUsingTagsTopicsAndCompanyMentions w-[354px] left-[218px] top-[2386px] absolute text-center justify-start"><span className="text-[#10112a] text-xl font-semibold font-['Inter'] leading-7">Discover real experiences – </span><span className="text-[#10112a] text-xl font-normal font-['Inter'] leading-7">using tags, topics, and company mentions</span></div>
  <img data-layer="Customer Testimonial-11" className="CustomerTestimonial11 size-[304px] left-[243px] top-[3304px] absolute" src="/figma/about-story-customer-testimonial-4.png" alt="customer testimonial 4" />
  <div data-layer="Join conversations – comment, react, and share your take" className="JoinConversationsCommentReactAndShareYourTake w-[354px] left-[218px] top-[3640px] absolute text-center justify-start"><span className="text-[#10112a] text-xl font-semibold font-['Inter'] leading-7">Join conversations –</span><span className="text-[#10112a] text-xl font-normal font-['Inter'] leading-7"> comment, react, and share your take</span></div>
  <div data-layer="Follow people who get it – stay connected to voices you care about" className="FollowPeopleWhoGetItStayConnectedToVoicesYouCareAbout w-[355px] left-[867px] top-[3012px] absolute text-center justify-start"><span className="text-[#10112a] text-xl font-semibold font-['Inter'] leading-7">Follow people who get it – </span><span className="text-[#10112a] text-xl font-normal font-['Inter'] leading-7">stay connected to voices you care about</span></div>
  <img data-layer="Customer Testimonial-07" className="CustomerTestimonial07 size-[304px] left-[892px] top-[2676px] absolute" src="/figma/about-story-customer-testimonial-3.png" alt="customer testimonial 3" />
  <div data-layer="Frame 48097148" className="Frame48097148 w-[1440px] h-[811px] left-0 top-[4516px] absolute bg-[#ffe0e0] ">
    <div data-layer="Frame 48097144" className="Frame48097144 w-[271px] h-72 left-[142px] top-[387px] absolute bg-[#fff5f5] rounded-2xl overflow-hidden">
      <div data-layer="Authenticity matters" className="AuthenticityMatters left-[24px] top-[168px] absolute justify-start text-[#10112a] text-xl font-semibold font-['Inter'] leading-7">Authenticity matters</div>
      <div data-layer="Real stories connect more than perfect ones" className="RealStoriesConnectMoreThanPerfectOnes w-[186px] left-[24px] top-[208px] absolute justify-start text-[#10112a] text-base font-medium font-['Inter'] leading-6">Real stories connect more than perfect ones</div>
      <img data-layer="messages-people-person-bubble-square-2--Streamline-Freehand" className="MessagesPeoplePersonBubbleSquare2StreamlineFreehand size-[72px] left-[24px] top-[32px] absolute" src="/figma/about-messages-1.svg" alt="messages icon" />
    </div>
    <div data-layer="Frame 48097145" className="Frame48097145 w-[271px] h-72 left-[437px] top-[387px] absolute bg-[#fff5f5] rounded-2xl overflow-hidden">
      <div data-layer="Gossipers first" className="GossipersFirst left-[24px] top-[168px] absolute justify-start text-[#10112a] text-xl font-semibold font-['Inter'] leading-7">Gossipers first </div>
      <div data-layer="Everyone has something valuable to share" className="EveryoneHasSomethingValuableToShare w-[231px] left-[24px] top-[208px] absolute justify-start text-[#10112a] text-base font-medium font-['Inter'] leading-6">Everyone has something valuable to share</div>
      <img data-layer="business-management-teamwork-clap--Streamline-Freehand" className="BusinessManagementTeamworkClapStreamlineFreehand size-[72px] left-[24px] top-[32px] absolute" src="/figma/about-messages-2.svg" alt="teamwork icon" />
    </div>
    <div data-layer="Frame 48097146" className="Frame48097146 w-[271px] h-72 left-[732px] top-[387px] absolute bg-[#fff5f5] rounded-2xl overflow-hidden">
      <div data-layer="Transparency helps" className="TransparencyHelps left-[24px] top-[168px] absolute justify-start text-[#10112a] text-xl font-semibold font-['Inter'] leading-7">Transparency helps</div>
      <div data-layer="The more we talk, the more we learn" className="TheMoreWeTalkTheMoreWeLearn w-[231px] left-[24px] top-[208px] absolute justify-start text-[#10112a] text-base font-medium font-['Inter'] leading-6">The more we talk, the more we learn</div>
      <img data-layer="collaboration-team-chat--Streamline-Freehand" className="CollaborationTeamChatStreamlineFreehand size-[72px] left-[24px] top-[32px] absolute" src="/figma/about-messages-3.svg" alt="collaboration icon" />
    </div>
    <div data-layer="Frame 48097147" className="Frame48097147 w-[271px] h-72 left-[1027px] top-[387px] absolute bg-[#fff5f5] rounded-2xl overflow-hidden">
      <div data-layer="Work can be fun!" className="WorkCanBeFun left-[24px] top-[168px] absolute justify-start text-[#10112a] text-xl font-semibold font-['Inter'] leading-7">Work can be fun!</div>
      <div data-layer="It's perfectly fine to find humor in the midst of chaos." className="ItSPerfectlyFineToFindHumorInTheMidstOfChaos w-[231px] left-[24px] top-[208px] absolute justify-start text-[#10112a] text-base font-medium font-['Inter'] leading-6">It&apos;s perfectly fine to find humor in the midst of chaos. </div>
      <img data-layer="smiley-thrilled--Streamline-Freehand" className="SmileyThrilledStreamlineFreehand size-[72px] left-[24px] top-[32px] absolute" src="/figma/about-messages-4.svg" alt="smiley icon" />
    </div>
    <div data-layer="Why We Exist" className="WhyWeExist left-[661px] top-[136px] absolute text-center justify-start text-[#454662] text-base font-medium font-['Inter'] uppercase">Why We Exist</div>
    <div data-layer="At SalesGossip, we believe work conversations don't always have to be polished or formal." className="AtSalesgossipWeBelieveWorkConversationsDonTAlwaysHaveToBePolishedOrFormal w-[854px] left-[293px] top-[171px] absolute text-center justify-start text-[#10112a] text-[40px] font-semibold font-['DM_Sans'] leading-[48px]">At SalesGossip, we believe work conversations <Underline bold={true}>don&apos;t&nbsp;a</Underline>lways have to be polished or formal.</div>
  </div>
  <div data-layer="Frame 48097149" className="Frame48097149 w-[1440px] h-[1238px] left-0 top-[5327px] absolute bg-[#fff5f5] overflow-hidden">
    <div data-layer="Frame 48097151" className="Frame48097151 w-[1156px] left-[142px] top-[291px] absolute inline-flex flex-col justify-start items-start">
      <div data-layer="Frame 48097144" className="Frame48097144 self-stretch relative border-b border-[#b7b7c2] overflow-hidden">
        <div className="cursor-pointer flex items-center justify-between p-6" onClick={() => toggleFAQ(0)}>
          <div data-layer="Is SalesGossip anonymous?" className="IsSalesgossipAnonymous justify-start text-[#10112a] text-xl font-semibold font-['Inter'] leading-7">Is SalesGossip anonymous?</div>
          <FAQButton isOpen={openFAQ === 0} />
        </div>
        <div className={`overflow-hidden transition-all duration-300 ${openFAQ === 0 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-6 pb-6 text-[#64647c] text-base font-normal font-['Inter'] leading-6">
            SalesGossip doesn’t require your real name to post or comment. Other users will only see the username you choose. We also hide any personal information that could identify you unless you share it voluntarily.
          </div>
        </div>
      </div>
      <div data-layer="Frame 48097145" className="Frame48097145 self-stretch relative border-b border-[#b7b7c2] overflow-hidden">
        <div className="cursor-pointer flex items-center justify-between p-6" onClick={() => toggleFAQ(1)}>
          <div data-layer="Who can use SalesGossip?" className="WhoCanUseSalesgossip justify-start text-[#10112a] text-xl font-semibold font-['Inter'] leading-7">Who can use SalesGossip?</div>
          <FAQButton isOpen={openFAQ === 1} />
        </div>
        <div className={`overflow-hidden transition-all duration-300 ${openFAQ === 1 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-6 pb-6 text-[#64647c] text-base font-normal font-['Inter'] leading-6">
            Anyone working in sales or interested in the sales world is welcome. Employees, founders, recruiters, SDRs, AEs, ops folks—everyone can join the conversation.
          </div>
        </div>
      </div>
      <div data-layer="Frame 48097146" className="Frame48097146 self-stretch relative border-b border-[#b7b7c2] overflow-hidden">
        <div className="cursor-pointer flex items-center justify-between p-6" onClick={() => toggleFAQ(2)}>
          <div data-layer="Can I mention a company or person in a post?" className="CanIMentionACompanyOrPersonInAPost justify-start text-[#10112a] text-xl font-semibold font-['Inter'] leading-7">Can I mention a company or person in a post?</div>
          <FAQButton isOpen={openFAQ === 2} />
        </div>
        <div className={`overflow-hidden transition-all duration-300 ${openFAQ === 2 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-6 pb-6 text-[#64647c] text-base font-normal font-['Inter'] leading-6">
            You can mention companies, teams, or industry trends. Avoid posting personal details or anything meant to target someone.
          </div>
        </div>
      </div>
      <div data-layer="Frame 48097147" className="Frame48097147 self-stretch relative border-b border-[#b7b7c2] overflow-hidden">
        <div className="cursor-pointer flex items-center justify-between p-6" onClick={() => toggleFAQ(3)}>
          <div data-layer="Are posts reviewed before going live?" className="ArePostsReviewedBeforeGoingLive justify-start text-[#10112a] text-xl font-semibold font-['Inter'] leading-7">Are posts reviewed before going live?</div>
          <FAQButton isOpen={openFAQ === 3} />
        </div>
        <div className={`overflow-hidden transition-all duration-300 ${openFAQ === 3 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-6 pb-6 text-[#64647c] text-base font-normal font-['Inter'] leading-6">
            Posts go live immediately. Our moderation system uses community reporting to keep content within the guidelines. Moderators step in when needed.
          </div>
        </div>
      </div>
      <div data-layer="Frame 48097148" className="Frame48097148 self-stretch relative border-b border-[#b7b7c2] overflow-hidden">
        <div className="cursor-pointer flex items-center justify-between p-6" onClick={() => toggleFAQ(4)}>
          <div data-layer="Can I delete or edit my post?" className="CanIDeleteOrEditMyPost justify-start text-[#10112a] text-xl font-semibold font-['Inter'] leading-7">Can I delete or edit my post?</div>
          <FAQButton isOpen={openFAQ === 4} />
        </div>
        <div className={`overflow-hidden transition-all duration-300 ${openFAQ === 4 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-6 pb-6 text-[#64647c] text-base font-normal font-['Inter'] leading-6">
            Yes. You can edit or delete your post at any time from your profile. Once deleted, it’s permanently removed from public view.
          </div>
        </div>
      </div>
      <div data-layer="Frame 48097149" className="Frame48097149 self-stretch relative border-b border-[#b7b7c2] overflow-hidden">
        <div className="cursor-pointer flex items-center justify-between p-6" onClick={() => toggleFAQ(5)}>
          <div data-layer="What kind of content isn't allowed?" className="WhatKindOfContentIsnTAllowed justify-start text-[#10112a] text-xl font-semibold font-['Inter'] leading-7">What kind of content isn&apos;t allowed?</div>
          <FAQButton isOpen={openFAQ === 5} />
        </div>
        <div className={`overflow-hidden transition-all duration-300 ${openFAQ === 5 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-6 pb-6 text-[#64647c] text-base font-normal font-['Inter'] leading-6">
            We don’t allow harassment, threats, hate speech, personal data, spam, or anything illegal. Keep discussions professional, constructive, and safe for the community.
          </div>
        </div>
      </div>
      <div data-layer="Frame 48097150" className="Frame48097150 self-stretch relative border-b border-[#b7b7c2] overflow-hidden">
        <div className="cursor-pointer flex items-center justify-between p-6" onClick={() => toggleFAQ(6)}>
          <div data-layer="Can I report a post or comment?" className="CanIReportAPostOrComment justify-start text-[#10112a] text-xl font-semibold font-['Inter'] leading-7">Can I report a post or comment?</div>
          <FAQButton isOpen={openFAQ === 6} />
        </div>
        <div className={`overflow-hidden transition-all duration-300 ${openFAQ === 6 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-6 pb-6 text-[#64647c] text-base font-normal font-['Inter'] leading-6">
            Absolutely. Every post and comment has a report option. Reports help moderators review content quickly and keep the platform healthy.
          </div>
        </div>
      </div>
    </div>
    <div data-layer="FAQS" className="Faqs left-[699px] top-[136px] absolute text-center justify-start text-[#454662] text-base font-medium font-['Inter'] uppercase">FAQS</div>
    <div data-layer="Your questions, answered." className="YourQuestionsAnswered w-[854px] left-[293px] top-[171px] absolute text-center justify-start text-[#10112a] text-[40px] font-semibold font-['DM_Sans'] leading-[48px]">Your questions, a<Underline bold={true}>nswered</Underline>.</div>
    <div data-layer="Still have questions?" className="StillHaveQuestions w-[854px] left-[293px] top-[982px] absolute text-center justify-start text-[#10112a] text-[40px] font-semibold font-['DM_Sans'] leading-[48px]">Still have questions? </div>
    <div data-layer="Primary Button" className="PrimaryButton h-10 px-5 py-2 left-[657.50px] top-[1062px] absolute bg-[#aa336a] rounded-[56px] inline-flex justify-center items-center gap-2 cursor-pointer" onClick={handleEmailUsClick}>
      <img data-layer="Email" src="/figma/about-email-icon.svg" alt="email" className="size-5" />
      <div data-layer="Button" className="Button justify-start text-white text-sm font-semibold font-['Inter']">Email us</div>
    </div>
    <EmailModal
      isOpen={showEmailModal}
      onClose={() => setShowEmailModal(false)}
    />
  </div>
  <div data-layer="Footer" className="Footer w-[1440px] h-[72px] left-0 top-[6565px] absolute bg-[#fff5f5] border-t border-[#b7b7c2] overflow-hidden">
    <div data-layer="Frame 48097041" className="Frame48097041 size- left-[142px] top-[20px] absolute inline-flex justify-start items-center gap-4">
      <div data-layer="Frame 101" className="Frame101 size- flex justify-center items-center gap-[4.47px]">
        <img data-layer="uuid-46414533-c34e-4145-a940-e20096abd5ec" src="/figma/about-footer-logo.png" alt="SalesGossip logo" className="w-[32.74px] h-8" />
        <div data-layer="SalesGossip" className="Salesgossip justify-start text-[#aa336a] text-[20.84px] font-black font-['DM_Sans']">SalesGossip</div>
      </div>
    </div>
    <img data-layer="LinkedIn" src="/figma/about-social-logo-1.png" alt="LinkedIn" className="absolute left-[1090px] top-[16px] size-10 cursor-pointer" />
    <img data-layer="Twitter" src="/figma/about-social-logo-2.png" alt="Twitter" className="absolute left-[1146px] top-[16px] size-10 cursor-pointer" />
    <img data-layer="Facebook" src="/figma/about-social-logo-3.png" alt="Facebook" className="absolute left-[1202px] top-[16px] size-10 cursor-pointer" />
    <img data-layer="Instagram" src="/figma/about-social-logo-4.png" alt="Instagram" className="absolute left-[1258px] top-[16px] size-10 cursor-pointer" />
    <div data-layer="Frame 48097152" className="Frame48097152 size- left-[323px] top-[24px] absolute inline-flex justify-start items-center gap-6">
      <div data-layer="Username" className="Username justify-start text-[#151636] text-base font-medium font-['Inter'] leading-6">Privacy policy</div>
      <div data-layer="Username" className="Username justify-start text-[#151636] text-base font-medium font-['Inter'] leading-6">Terms of services</div>
    </div>
  </div>
  <div className="Header w-full h-[72px] left-0 top-0 absolute bg-[#fff5f5]">
    <div className="max-w-[1156px] mx-auto flex items-center justify-between h-full px-4">
      <div className="flex items-center gap-2">
        <img src="/figma/header-logo.svg" alt="SalesGossip logo" style={{width: 33, height: 32}} />
        <div className="text-[#aa336a] text-[20.84px] font-black font-['DM_Sans']">SalesGossip</div>
      </div>
      <div className="flex items-center gap-8">
        <button className="text-[#151636] text-base font-medium font-['Inter'] cursor-pointer hover:text-[#aa336a] transition-colors" onClick={() => scrollToSection("How It Works")}>How it works</button>
        <button className="text-[#151636] text-base font-medium font-['Inter'] cursor-pointer hover:text-[#aa336a] transition-colors" onClick={() => scrollToSection("Frame 48097148")}>Why we exist</button>
        <button className="text-[#151636] text-base font-medium font-['Inter'] cursor-pointer hover:text-[#aa336a] transition-colors" onClick={() => scrollToSection("Frame 48097149")}>FAQs</button>
      </div>
      <button className="bg-[#aa336a] rounded-[56px] text-white text-sm font-semibold px-5 py-2 h-10 cursor-pointer" onClick={goToHome}>Visit SalesGossip</button>
    </div>
  </div>
  </div>
)
}

export default About
