import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkUsernameAvailability, submitFormB } from "../api";
import { FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import TTTLogo from "../assets/images/TTTlogo- rigiterions.png";
import Navbar from "../components/layout/Navbar";

const INDIA_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan",
  "Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu",
  "Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

const DISTRICTS_BY_STATE = {
  "Andhra Pradesh": ["Anantapur","Chittoor","East Godavari","Guntur","Krishna","Kurnool","Prakasam","Srikakulam","Sri Potti Sriramulu Nellore","Visakhapatnam","Vizianagaram","West Godavari","YSR Kadapa"],
  "Arunachal Pradesh": ["Anjaw","Changlang","Dibang Valley","East Kameng","East Siang","Kurung Kumey","Lohit","Lower Dibang Valley","Lower Subansiri","Papum Pare","Tawang","Tirap","Upper Siang","Upper Subansiri","West Kameng","West Siang"],
  "Assam": ["Baksa","Barpeta","Bongaigaon","Cachar","Chirang","Darrang","Dhemaji","Dhubri","Dibrugarh","Goalpara","Golaghat","Hailakandi","Jorhat","Kamrup","Kamrup Metropolitan","Karbi Anglong","Karimganj","Kokrajhar","Lakhimpur","Morigaon","Nagaon","Nalbari","Sivasagar","Sonitpur","Tinsukia","Udalguri"],
  "Bihar": ["Araria","Arwal","Aurangabad","Banka","Begusarai","Bhagalpur","Bhojpur","Buxar","Darbhanga","East Champaran","Gaya","Gopalganj","Jamui","Jehanabad","Kaimur","Katihar","Khagaria","Kishanganj","Lakhisarai","Madhepura","Madhubani","Munger","Muzaffarpur","Nalanda","Nawada","Patna","Purnia","Rohtas","Saharsa","Samastipur","Saran","Sheikhpura","Sheohar","Sitamarhi","Siwan","Supaul","Vaishali","West Champaran"],
  "Chhattisgarh": ["Balod","Baloda Bazar","Balrampur","Bastar","Bemetara","Bijapur","Bilaspur","Dantewada","Dhamtari","Durg","Gariaband","Janjgir-Champa","Jashpur","Kabirdham","Kanker","Kondagaon","Korba","Koriya","Mahasamund","Mungeli","Narayanpur","Raigarh","Raipur","Rajnandgaon","Sukma","Surajpur","Surguja"],
  "Goa": ["North Goa","South Goa"],
  "Gujarat": ["Ahmedabad","Amreli","Anand","Aravalli","Banaskantha","Bharuch","Bhavnagar","Botad","Chhota Udaipur","Dahod","Dang","Devbhumi Dwarka","Gandhinagar","Gir Somnath","Jamnagar","Junagadh","Kheda","Kutch","Mahisagar","Mehsana","Morbi","Narmada","Navsari","Panchmahal","Patan","Porbandar","Rajkot","Sabarkantha","Surat","Surendranagar","Tapi","Vadodara","Valsad"],
  "Haryana": ["Ambala","Bhiwani","Charkhi Dadri","Faridabad","Fatehabad","Gurugram","Hisar","Jhajjar","Jind","Kaithal","Karnal","Kurukshetra","Mahendragarh","Nuh","Palwal","Panchkula","Panipat","Rewari","Rohtak","Sirsa","Sonipat","Yamunanagar"],
  "Himachal Pradesh": ["Bilaspur","Chamba","Hamirpur","Kangra","Kinnaur","Kullu","Lahaul and Spiti","Mandi","Shimla","Sirmaur","Solan","Una"],
  "Jharkhand": ["Bokaro","Chatra","Deoghar","Dhanbad","Dumka","East Singhbhum","Garhwa","Giridih","Godda","Gumla","Hazaribag","Jamtara","Khunti","Koderma","Latehar","Lohardaga","Pakur","Palamu","Ramgarh","Ranchi","Sahibganj","Seraikela Kharsawan","Simdega","West Singhbhum"],
  "Karnataka": ["Bagalkot","Ballari","Belagavi","Bengaluru Rural","Bengaluru Urban","Bidar","Chamarajanagar","Chikkaballapur","Chikkamagaluru","Chitradurga","Dakshina Kannada","Davanagere","Dharwad","Gadag","Hassan","Haveri","Kalaburagi","Kodagu","Kolar","Koppal","Mandya","Mysuru","Raichur","Ramanagara","Shivamogga","Tumakuru","Udupi","Uttara Kannada","Vijayapura","Yadgir"],
  "Kerala": ["Alappuzha","Ernakulam","Idukki","Kannur","Kasaragod","Kollam","Kottayam","Kozhikode","Malappuram","Palakkad","Pathanamthitta","Thiruvananthapuram","Thrissur","Wayanad"],
  "Madhya Pradesh": ["Agar Malwa","Alirajpur","Anuppur","Ashoknagar","Balaghat","Barwani","Betul","Bhind","Bhopal","Burhanpur","Chhatarpur","Chhindwara","Damoh","Datia","Dewas","Dhar","Dindori","Guna","Gwalior","Harda","Hoshangabad","Indore","Jabalpur","Jhabua","Katni","Khandwa","Khargone","Mandla","Mandsaur","Morena","Narsinghpur","Neemuch","Panna","Raisen","Rajgarh","Ratlam","Rewa","Sagar","Satna","Sehore","Seoni","Shahdol","Shajapur","Sheopur","Shivpuri","Sidhi","Singrauli","Tikamgarh","Ujjain","Umaria","Vidisha"],
  "Maharashtra": ["Ahmednagar","Akola","Amravati","Aurangabad","Beed","Bhandara","Buldhana","Chandrapur","Dhule","Gadchiroli","Gondia","Hingoli","Jalgaon","Jalna","Kolhapur","Latur","Mumbai City","Mumbai Suburban","Nagpur","Nanded","Nandurbar","Nashik","Osmanabad","Palghar","Parbhani","Pune","Raigad","Ratnagiri","Sangli","Satara","Sindhudurg","Solapur","Thane","Wardha","Washim","Yavatmal"],
  "Manipur": ["Bishnupur","Chandel","Churachandpur","Imphal East","Imphal West","Senapati","Tamenglong","Thoubal","Ukhrul"],
  "Meghalaya": ["East Garo Hills","East Jaintia Hills","East Khasi Hills","North Garo Hills","Ri Bhoi","South Garo Hills","South West Garo Hills","South West Khasi Hills","West Garo Hills","West Jaintia Hills","West Khasi Hills"],
  "Mizoram": ["Aizawl","Champhai","Kolasib","Lawngtlai","Lunglei","Mamit","Saiha","Serchhip"],
  "Nagaland": ["Dimapur","Kiphire","Kohima","Longleng","Mokokchung","Mon","Peren","Phek","Tuensang","Wokha","Zunheboto"],
  "Odisha": ["Angul","Balangir","Balasore","Bargarh","Bhadrak","Boudh","Cuttack","Deogarh","Dhenkanal","Gajapati","Ganjam","Jagatsinghpur","Jajpur","Jharsuguda","Kalahandi","Kandhamal","Kendrapara","Kendujhar","Khordha","Koraput","Malkangiri","Mayurbhanj","Nabarangpur","Nayagarh","Nuapada","Puri","Rayagada","Sambalpur","Subarnapur","Sundargarh"],
  "Punjab": ["Amritsar","Barnala","Bathinda","Faridkot","Fatehgarh Sahib","Fazilka","Ferozepur","Gurdaspur","Hoshiarpur","Jalandhar","Kapurthala","Ludhiana","Malerkotla","Mansa","Moga","Pathankot","Patiala","Rupnagar","Sahibzada Ajit Singh Nagar","Sangrur","Shaheed Bhagat Singh Nagar","Sri Muktsar Sahib","Tarn Taran"],
  "Rajasthan": ["Ajmer","Alwar","Banswara","Baran","Barmer","Bharatpur","Bhilwara","Bikaner","Bundi","Chittorgarh","Churu","Dausa","Dholpur","Dungarpur","Hanumangarh","Jaipur","Jaisalmer","Jalore","Jhalawar","Jhunjhunu","Jodhpur","Karauli","Kota","Nagaur","Pali","Pratapgarh","Rajsamand","Sawai Madhopur","Sikar","Sirohi","Sri Ganganagar","Tonk","Udaipur"],
  "Sikkim": ["East Sikkim","North Sikkim","South Sikkim","West Sikkim"],
  "Tamil Nadu": ["Ariyalur","Chennai","Coimbatore","Cuddalore","Dharmapuri","Dindigul","Erode","Kanchipuram","Kanyakumari","Karur","Krishnagiri","Madurai","Nagapattinam","Namakkal","Perambalur","Pudukkottai","Ramanathapuram","Salem","Sivaganga","Thanjavur","The Nilgiris","Theni","Thiruvallur","Thiruvarur","Thoothukudi","Tiruchirappalli","Tirunelveli","Tiruppur","Tiruvannamalai","Vellore","Viluppuram","Virudhunagar"],
  "Telangana": ["Adilabad","Bhadradri Kothagudem","Hyderabad","Jagtial","Jangaon","Jayashankar Bhupalapally","Jogulamba Gadwal","Kamareddy","Karimnagar","Khammam","Komaram Bheem Asifabad","Mahabubabad","Mahabubnagar","Mancherial","Medak","Medchal–Malkajgiri","Nagarkurnool","Nalgonda","Nirmal","Nizamabad","Peddapalli","Rajanna Sircilla","Ranga Reddy","Sangareddy","Siddipet","Suryapet","Vikarabad","Wanaparthy","Warangal Rural","Warangal Urban","Yadadri Bhuvanagiri"],
  "Tripura": ["Dhalai","Gomati","Khowai","North Tripura","Sepahijala","South Tripura","Unakoti","West Tripura"],
  "Uttar Pradesh": ["Agra","Aligarh","Prayagraj","Ambedkar Nagar","Amethi","Amroha","Auraiya","Azamgarh","Baghpat","Bahraich","Ballia","Balrampur","Banda","Barabanki","Bareilly","Basti","Bhadohi","Bijnor","Budaun","Bulandshahr","Chandauli","Chitrakoot","Deoria","Etah","Etawah","Ayodhya","Farrukhabad","Fatehpur","Firozabad","Gautam Buddha Nagar","Ghaziabad","Ghazipur","Gonda","Gorakhpur","Hamirpur","Hapur","Hardoi","Hathras","Jalaun","Jaunpur","Jhansi","Kannauj","Kanpur Dehat","Kanpur Nagar","Kasganj","Kaushambi","Kushinagar","Lakhimpur Kheri","Lalitpur","Lucknow","Maharajganj","Mahoba","Mainpuri","Mathura","Mau","Meerut","Mirzapur","Moradabad","Muzaffarnagar","Pilibhit","Pratapgarh","Raebareli","Rampur","Saharanpur","Sambhal","Sant Kabir Nagar","Shahjahanpur","Shamli","Shravasti","Siddharth Nagar","Sitapur","Sonbhadra","Sultanpur","Unnao","Varanasi"],
  "Uttarakhand": ["Almora","Bageshwar","Chamoli","Champawat","Dehradun","Haridwar","Nainital","Pauri Garhwal","Pithoragarh","Rudraprayag","Tehri Garhwal","Udham Singh Nagar","Uttarkashi"],
  "West Bengal": ["Alipurduar","Bankura","Birbhum","Cooch Behar","Dakshin Dinajpur","Darjeeling","Hooghly","Howrah","Jalpaiguri","Jhargram","Kalimpong","Kolkata","Malda","Murshidabad","Nadia","North 24 Parganas","Paschim Bardhaman","Paschim Medinipur","Purba Bardhaman","Purba Medinipur","Purulia","South 24 Parganas","Uttar Dinajpur"],
  "Andaman and Nicobar Islands": ["Nicobar","North and Middle Andaman","South Andaman"],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Dadra and Nagar Haveli","Daman","Diu"],
  "Delhi": ["Central Delhi","East Delhi","New Delhi","North Delhi","North East Delhi","North West Delhi","Shahdara","South Delhi","South East Delhi","South West Delhi","West Delhi"],
  "Jammu and Kashmir": ["Anantnag","Bandipora","Baramulla","Budgam","Doda","Ganderbal","Jammu","Kathua","Kishtwar","Kulgam","Kupwara","Poonch","Pulwama","Rajouri","Ramban","Reasi","Samba","Shopian","Srinagar","Udhampur"],
  "Ladakh": ["Kargil","Leh"],
  "Lakshadweep": ["Lakshadweep"],
  "Puducherry": ["Karaikal","Mahe","Puducherry","Yanam"],
};

const SOCIAL_LINKS = [
  { id: "youtube", label: "YouTube", href: "https://www.youtube.com/@TheTrueTopper", icon: FaYoutube, color: "#FF0000", bg: "#FFF0F0" },
  { id: "instagram", label: "Instagram", href: "https://www.instagram.com/thetruetopperpvtltd/", icon: FaInstagram, color: "#E1306C", bg: "#FFF0F7" },
  { id: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/company/thetruetopper/posts/?feedView=all", icon: FaLinkedin, color: "#0A66C2", bg: "#F0F6FF" },
];

const STEPS = [
  { id: 1, title: "Verification", subtitle: "Confirm your details", icon: "🔒" },
  { id: 2, title: "Credentials", subtitle: "Username & Password", icon: "🔑" },
  { id: 3, title: "Contact", subtitle: "Personal information", icon: "📋" },
  { id: 4, title: "School", subtitle: "School information", icon: "🏫" },
  { id: 5, title: "Parents", subtitle: "Father & Mother details", icon: "👨‍👩‍👧" },
  { id: 6, title: "Siblings", subtitle: "Family details", icon: "👨‍👩‍👦" },
  { id: 7, title: "Follow Us", subtitle: "Social channels", icon: "⭐" },
];

const SIBLING_CLASS_OPTIONS = ["10th","11th","12th","Diploma","BA","BCom","BSc","BCA","BCS","Other"];

const DOB_MIN_YEAR = 1900;
const DOB_MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const getDaysInMonth = (year, month) => {
  if (!year || !month) return 31;
  return new Date(Number(year), Number(month), 0).getDate();
};

const buildSiblingDetails = (count) =>
  Array.from({ length: count }, () => ({ name: "", age: "", class: "" }));

// ─── Reusable Components ───────────────────────────────────────────────────────

const Label = ({ children, required }) => (
  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#374151", marginBottom: "5px", letterSpacing: "0.02em" }}>
    {children} {required && <span style={{ color: "#EF4444" }}>*</span>}
  </label>
);

const inputBase = {
  width: "100%",
  borderRadius: "10px",
  border: "1.5px solid #E5E7EB",
  padding: "9px 13px",
  fontSize: "13px",
  color: "#111827",
  background: "#FAFAFA",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
  boxSizing: "border-box",
};

const inputFocusStyle = {
  borderColor: "#FFCD2C",
  boxShadow: "0 0 0 3px rgba(255,205,44,0.15)",
  background: "#FFFEF5",
};

const selectFocusStyle = {
  borderColor: "#FFCD2C",
  boxShadow: "0 0 0 3px rgba(255,205,44,0.15)",
};

const inputInvalidStyle = {
  borderColor: "#EF4444",
  boxShadow: "0 0 0 3px rgba(239,68,68,0.15)",
  background: "#FEF2F2",
};

const selectInvalidStyle = {
  borderColor: "#EF4444",
  boxShadow: "0 0 0 3px rgba(239,68,68,0.15)",
  background: "#FEF2F2",
};

const Input = ({ style, invalid = false, onFocus, onBlur, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <input
      style={{
        ...inputBase,
        ...style,
        ...(invalid ? inputInvalidStyle : {}),
        ...(!invalid && focused ? inputFocusStyle : {})
      }}
      onFocus={e => { setFocused(true); if (onFocus) onFocus(e); }}
      onBlur={e => { setFocused(false); if (onBlur) onBlur(e); }}
      {...props}
    />
  );
};

const Select = ({ style, children, invalid = false, onFocus, onBlur, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <select
      style={{
        ...inputBase,
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        paddingRight: "36px",
        cursor: "pointer",
        ...style,
        ...(invalid ? selectInvalidStyle : {}),
        ...(!invalid && focused ? selectFocusStyle : {})
      }}
      onFocus={e => { setFocused(true); if (onFocus) onFocus(e); }}
      onBlur={e => { setFocused(false); if (onBlur) onBlur(e); }}
      {...props}
    >
      {children}
    </select>
  );
};

const FieldGroup = ({ children, style }) => (
  <div style={{ display: "grid", gap: "16px", ...style }}>{children}</div>
);

const Card = ({ children, style }) => (
  <div style={{ background: "#FFFFFF", border: "1.5px solid #F3F4F6", borderRadius: "14px", padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", ...style }}>
    {children}
  </div>
);

const EyeIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M3 3l18 18" /><path d="M10.5 10.5a2 2 0 0 0 2.9 2.9" />
        <path d="M9.9 5.1a9.9 9.9 0 0 1 2.1-.2c6 0 9.8 7 9.8 7a18.4 18.4 0 0 1-3.1 4.3" />
        <path d="M6.2 6.2A18.4 18.4 0 0 0 2.2 12s3.8 7 9.8 7a9.9 9.9 0 0 0 4.3-.9" />
      </>
    ) : (
      <>
        <path d="M1.5 12s4.5-7 10.5-7 10.5 7 10.5 7-4.5 7-10.5 7S1.5 12 1.5 12z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

const PasswordInput = ({ value, onChange, placeholder, show, onToggle, invalid }) => (
  <div style={{ position: "relative" }}>
    <Input
      type={show ? "text" : "password"}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{ paddingRight: "40px" }}
      invalid={invalid}
    />
    <button
      type="button"
      onClick={onToggle}
      onMouseDown={(e) => e.preventDefault()}
      style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 0, display: "flex", alignItems: "center" }}
    >
      <EyeIcon open={show} />
    </button>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────

export default function RegisterFormB() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [logoStep, setLogoStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [stepNotice, setStepNotice] = useState("");
  const [usernameStatus, setUsernameStatus] = useState({ state: "idle", message: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accountRole, setAccountRole] = useState("student");
  const [expectedVerification, setExpectedVerification] = useState({ name: "", mobile: "" });
  const [showFieldErrors, setShowFieldErrors] = useState(false);
  const addressAutoFillRef = useRef({ active: false, value: "" });

  const [form, setForm] = useState({
    verification: { fullName: "", whatsappNumber: "" },
    account: { username: "", password: "", confirmPassword: "" },
    contact: { email: "", dob: "", country: "India", countryOther: "", state: "", district: "", districtOther: "", pinCode: "", gender: "", address: "" },
    school: { country: "India", countryOther: "", name: "", state: "", district: "", districtOther: "", pinCode: "" },
    parents: {
      father: { name: "", phone: "", email: "", profession: "" },
      mother: { name: "", phone: "", email: "", profession: "" },
    },
    siblings: { count: 1, details: buildSiblingDetails(1) },
    social: { followed: false },
  });

  const [dobParts, setDobParts] = useState(() => {
    const [year, month, day] = String(form.contact.dob || "").split("-");
    return { year: year || "", month: month || "", day: day || "" };
  });

  const todayParts = useMemo(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: String(now.getMonth() + 1).padStart(2, "0"),
      day: String(now.getDate()).padStart(2, "0"),
    };
  }, []);

  const dobYearOptions = useMemo(() => {
    const years = [];
    for (let year = todayParts.year; year >= DOB_MIN_YEAR; year -= 1) {
      years.push(String(year));
    }
    return years;
  }, [todayParts.year]);

  const dobMonthOptions = useMemo(() => {
    if (dobParts.year === String(todayParts.year)) {
      return DOB_MONTHS.slice(0, Number(todayParts.month));
    }
    return DOB_MONTHS;
  }, [dobParts.year, todayParts.year, todayParts.month]);

  const dobMaxDay = useMemo(() => {
    let maxDay = getDaysInMonth(dobParts.year, dobParts.month);
    if (dobParts.year === String(todayParts.year) && dobParts.month === todayParts.month) {
      maxDay = Math.min(maxDay, Number(todayParts.day));
    }
    return maxDay;
  }, [dobParts.year, dobParts.month, todayParts.year, todayParts.month, todayParts.day]);

  const dobDayOptions = useMemo(() => (
    Array.from({ length: dobMaxDay }, (_, i) => String(i + 1).padStart(2, "0"))
  ), [dobMaxDay]);

  const districtOptions = useMemo(() => DISTRICTS_BY_STATE[form.contact.state] || [], [form.contact.state]);
  const schoolDistrictOptions = useMemo(() => DISTRICTS_BY_STATE[form.school.state] || [], [form.school.state]);

  useEffect(() => {
    const count = Number(form.siblings.count || 0);
    if (!Number.isFinite(count) || count < 0) return;
    setForm((prev) => ({
      ...prev,
      siblings: {
        ...prev.siblings,
        details: buildSiblingDetails(count).map((s, idx) => {
          const existing = prev.siblings.details?.[idx];
          return existing ? { ...s, ...existing } : s;
        }),
      },
    }));
  }, [form.siblings.count]);

  useEffect(() => {
    if (!form.contact.dob) return;
    const [year, month, day] = String(form.contact.dob).split("-");
    if (!year || !month || !day) return;
    setDobParts((prev) => {
      if (prev.year === year && prev.month === month && prev.day === day) return prev;
      return { year, month, day };
    });
  }, [form.contact.dob]);

  useEffect(() => {
    if (!stepNotice) return;
    const id = setTimeout(() => setStepNotice(""), 1600);
    return () => clearTimeout(id);
  }, [stepNotice]);

  useEffect(() => {
    const storedName = String(localStorage.getItem("formAName") || "").trim();
    const storedMobile = String(localStorage.getItem("formAMobile") || "").trim();
    setExpectedVerification({ name: storedName, mobile: storedMobile });
    if (!storedName || !storedMobile) {
      setError("Form A details not found. Please proceed to payment.");
      setTimeout(() => navigate("/payment"), 800);
    }
  }, [navigate]);

  useEffect(() => {
    const username = String(form.account.username || "").trim();
    if (!username) { setUsernameStatus({ state: "idle", message: "" }); return; }
    if (username.length < 3) { setUsernameStatus({ state: "invalid", message: "Username must be at least 3 characters." }); return; }
    let cancelled = false;
    setUsernameStatus({ state: "checking", message: "Checking availability..." });
    const timer = setTimeout(async () => {
      try {
        const res = await checkUsernameAvailability({ username, role: accountRole });
        if (cancelled) return;
        if (res?.success === false) { setUsernameStatus({ state: "error", message: res?.message || "Unable to verify username right now." }); return; }
        setUsernameStatus(res?.available
          ? { state: "available", message: "Username is available." }
          : { state: "taken", message: "Username already taken." }
        );
      } catch {
        if (!cancelled) setUsernameStatus({ state: "error", message: "Unable to verify username right now." });
      }
    }, 500);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [form.account.username, accountRole]);

  const setField = (path, value) => {
    setForm((prev) => {
      const next = { ...prev };
      const keys = path.split(".");
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) {
        cur[keys[i]] = { ...cur[keys[i]] };
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleWhatsAppChange = (value) => {
    setField("verification.whatsappNumber", String(value || "").replace(/\D/g, "").slice(0, 10));
  };

  const handlePinCodeChange = (value) => {
    setField("contact.pinCode", String(value || "").replace(/\D/g, "").slice(0, 6));
  };

  const handleAddressChange = (value) => {
    setField("contact.address", value);
    if (addressAutoFillRef.current.active && value !== addressAutoFillRef.current.value) {
      addressAutoFillRef.current = { active: false, value: "" };
    }
    if (!String(value || "").trim()) {
      addressAutoFillRef.current = { active: false, value: "" };
    }
  };

  const buildAutoAddress = () => {
    const pin = String(form.contact.pinCode || "").trim();
    if (pin.length !== 6) return "";
    const country = form.contact.country === "Other" ? form.contact.countryOther : form.contact.country;
    const district = form.contact.district === "Other" ? form.contact.districtOther : form.contact.district;
    const parts = [];
    if (district) parts.push(district);
    if (form.contact.state) parts.push(form.contact.state);
    if (country) parts.push(country);
    const base = parts.join(", ");
    return base ? `${base} - ${pin}` : pin;
  };

  useEffect(() => {
    const autoAddress = buildAutoAddress();
    if (!autoAddress) return;
    const currentAddress = String(form.contact.address || "").trim();
    const lastAuto = addressAutoFillRef.current.value;
    const canAutoFill = !currentAddress || currentAddress === lastAuto;
    if (!canAutoFill || currentAddress === autoAddress) return;
    addressAutoFillRef.current = { active: true, value: autoAddress };
    setField("contact.address", autoAddress);
  }, [
    form.contact.pinCode,
    form.contact.country,
    form.contact.countryOther,
    form.contact.state,
    form.contact.district,
    form.contact.districtOther,
  ]);

  const updateDobPart = (part, value) => {
    setDobParts((prev) => {
      const next = { ...prev, [part]: value };
      const currentYear = String(todayParts.year);

      if (!next.year) {
        next.month = "";
        next.day = "";
      }

      if (next.year) {
        const maxMonth = next.year === currentYear ? Number(todayParts.month) : 12;
        if (next.month && Number(next.month) > maxMonth) {
          next.month = "";
          next.day = "";
        }
      }

      if (next.day) {
        let maxDay = getDaysInMonth(next.year, next.month);
        if (next.year === currentYear && next.month === todayParts.month) {
          maxDay = Math.min(maxDay, Number(todayParts.day));
        }
        if (Number(next.day) > maxDay) {
          next.day = String(maxDay).padStart(2, "0");
        }
      }

      const isComplete = next.year && next.month && next.day;
      const nextDob = isComplete ? `${next.year}-${next.month}-${next.day}` : "";
      if (nextDob !== form.contact.dob) {
        setField("contact.dob", nextDob);
      }
      return next;
    });
  };

  const isBlank = (value) => !String(value || "").trim();

  const normalizeName = (v) => String(v || "").trim().toLowerCase();
  const normalizeMobile = (v) => String(v || "").replace(/\D/g, "");
  const expectedName = normalizeName(expectedVerification.name);
  const expectedMobile = normalizeMobile(expectedVerification.mobile);
  const enteredName = normalizeName(form.verification.fullName);
  const enteredMobile = normalizeMobile(form.verification.whatsappNumber);
  const isWhatsAppValid = enteredMobile.length === 10;
  const hasExpectedVerification = Boolean(expectedName && expectedMobile);
  const hasEnteredVerification = Boolean(enteredName && isWhatsAppValid);
  const isVerificationMatch = hasExpectedVerification && enteredName === expectedName && enteredMobile === expectedMobile;
  const showPaymentRedirect = step === 1 && hasEnteredVerification && !isVerificationMatch;

  const usernamePrefix = accountRole === "teacher" ? "@T-" : accountRole === "parent" ? "@P-" : "@S-";

  const redirectToPayment = (note) => {
    setMessage("");
    setError(note);
    setTimeout(() => navigate("/payment"), 800);
  };

  const validateStep = (current) => {
    if (current === 1) {
      if (!form.verification.fullName.trim()) return "Full name is required.";
      if (!form.verification.whatsappNumber.trim()) return "WhatsApp number is required.";
      if (form.verification.whatsappNumber.trim().length !== 10) return "WhatsApp number must be exactly 10 digits.";
    }
    if (current === 2) {
      if (!form.account.username.trim()) return "Username is required.";
      if (usernameStatus.state === "checking") return "Please wait, checking username availability.";
      if (usernameStatus.state === "taken") return "Username already taken.";
      if (usernameStatus.state === "invalid") return usernameStatus.message || "Username is invalid.";
      if (usernameStatus.state === "error") return "Unable to verify username. Please try again.";
      if (!form.account.password.trim()) return "Password is required.";
      if (form.account.password.length < 6) return "Password must be at least 6 characters.";
      if (!form.account.confirmPassword.trim()) return "Confirm password is required.";
      if (form.account.password !== form.account.confirmPassword) return "Passwords do not match.";
    }
    if (current === 3) {
      const c = form.contact;
      if (!c.email.trim()) return "Gmail is required.";
      if (!c.dob.trim()) return "Date of birth is required.";
      if (!c.country) return "Country is required.";
      if (c.country === "Other" && !c.countryOther.trim()) return "Country name is required.";
      if (c.country === "India") {
        if (!c.state) return "State is required.";
        if (!c.district) return "District is required.";
        if (c.district === "Other" && !c.districtOther.trim()) return "District name is required.";
      }
      if (!c.gender) return "Gender is required.";
    }
    if (current === 4) {
      const s = form.school;
      if (!s.country) return "School country is required.";
      if (!s.name.trim()) return "School name is required.";
      if (s.country === "Other" && !s.countryOther.trim()) return "School country name is required.";
      if (s.country === "India" && !s.state) return "School state is required.";
      if (s.district === "Other" && !s.districtOther.trim()) return "School district name is required.";
    }
    if (current === 5) {
      if (!form.parents.father.name.trim()) return "Father name is required.";
      if (!form.parents.father.phone.trim()) return "Father mobile number is required.";
      if (!form.parents.mother.name.trim()) return "Mother name is required.";
      if (!form.parents.mother.phone.trim()) return "Mother mobile number is required.";
    }
    if (current === 6) {
      const count = Number(form.siblings.count || 0);
      if (!Number.isFinite(count) || count < 1) return "Number of siblings is required.";
      for (let i = 0; i < count; i++) {
        const s = form.siblings.details[i];
        if (!s?.name?.trim()) return `Sibling ${i + 1} name is required.`;
        if (!s?.age?.trim()) return `Sibling ${i + 1} age is required.`;
        if (!s?.class?.trim()) return `Sibling ${i + 1} class is required.`;
      }
    }
    return "";
  };

  const goToStepWithLogo = (target) => {
    setLoading(true);
    setTimeout(() => { setLogoStep(target); setStep(target); setLoading(false); }, 300);
  };

  const handleNext = () => {
    const issue = validateStep(step);
    if (issue) { setError(issue); setShowFieldErrors(true); return; }
    if (step === 1) {
      if (!hasExpectedVerification) { redirectToPayment("Form A details not found. Please proceed to payment."); setShowFieldErrors(true); return; }
      if (!isVerificationMatch) { redirectToPayment("Name and WhatsApp number must match Form A. Redirecting to payment..."); setShowFieldErrors(true); return; }
    }
    setError("");
    setShowFieldErrors(false);
    setStepNotice(`Step ${step} completed ✓`);
    goToStepWithLogo(Math.min(step + 1, STEPS.length));
  };

  const handleBack = () => {
    setError("");
    setShowFieldErrors(false);
    goToStepWithLogo(Math.max(step - 1, 1));
  };

  const handleSubmit = async () => {
    if (!hasExpectedVerification) { redirectToPayment("Form A details not found. Please proceed to payment."); return; }
    if (!isVerificationMatch) { redirectToPayment("Name and WhatsApp number must match Form A. Redirecting to payment..."); return; }
    const issue = validateStep(step);
    if (issue) { setError(issue); setShowFieldErrors(true); return; }
    setLoading(true);
    setShowFieldErrors(false);
    setError("");
    setMessage("");
    const contactCountry = form.contact.country === "Other" ? form.contact.countryOther : form.contact.country;
    const schoolCountry = form.school.country === "Other" ? form.school.countryOther : form.school.country;
    const payload = {
      ...form,
      role: accountRole,
      account: { username: form.account.username, password: form.account.password },
      contact: { ...form.contact, country: contactCountry, district: form.contact.district === "Other" ? form.contact.districtOther : form.contact.district },
      school: { ...form.school, country: schoolCountry, district: form.school.district === "Other" ? form.school.districtOther : form.school.district },
    };
    try {
      const res = await submitFormB(payload);
      if (!res?.success) { setError(res?.message || "Submission failed."); setLoading(false); return; }
      try {
        localStorage.setItem("studentProfileName", String(form.verification.fullName || expectedVerification.name || "").trim());
        localStorage.setItem("studentProfileUsername", String(form.account.username || "").trim());
        localStorage.setItem("studentProfileEmail", String(form.contact.email || "").trim());
      } catch {}
      setMessage("Registration successful! Redirecting to your dashboard...");
      setTimeout(() => navigate("/student"), 1200);
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentStep = STEPS.find((s) => s.id === step);

  const usernameBorderColor =
    usernameStatus.state === "available" ? "#10B981" :
    usernameStatus.state === "taken" || usernameStatus.state === "invalid" || usernameStatus.state === "error" ? "#EF4444" :
    usernameStatus.state === "checking" ? "#F59E0B" : "#E5E7EB";

  const usernameStatusColor =
    usernameStatus.state === "available" ? "#10B981" :
    usernameStatus.state === "checking" ? "#F59E0B" : "#EF4444";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #FFFBEB 0%, #FFFFFF 50%, #FFF8DC 100%)" }}>
      <Navbar onStudentLoginClick={() => navigate("/login")} />

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 16px 40px" }}>

        {/* HEADER */}
        <div style={{ background: "linear-gradient(135deg, #FFCD2C 0%, #E0AC00 100%)", borderRadius: "20px", padding: "20px 24px", marginBottom: "20px", boxShadow: "0 4px 20px rgba(224,172,0,0.3)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(255,255,255,0.9)", padding: "6px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <img src={TTTLogo} alt="True Topper" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "8px" }} />
            </div>
            <div>
              <h1 style={{ fontSize: "18px", fontWeight: 700, color: "#1A1A00", margin: 0, lineHeight: 1.2 }}>Student Registration Form</h1>
              <p style={{ fontSize: "12px", color: "#5C4A00", margin: "3px 0 0", fontWeight: 500 }}>
                Step {step} of {STEPS.length} — {currentStep?.title}
              </p>
            </div>
          </div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#5C4A00", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.8 }}>Form B</div>
        </div>

        {/* STEP PROGRESS BAR */}
        <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "16px 20px", marginBottom: "16px", border: "1.5px solid #F3F4F6", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", overflowX: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: "max-content" }}>
            {STEPS.map((s, idx) => {
              const isActive = s.id === step;
              const isCompleted = s.id < step;
              return (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{
                      width: "34px", height: "34px", borderRadius: "50%",
                      background: isActive ? "linear-gradient(135deg, #FFCD2C, #E0AC00)" : isCompleted ? "#FEF3C7" : "#F9FAFB",
                      border: isActive ? "2px solid #E0AC00" : isCompleted ? "2px solid #FBBF24" : "2px solid #E5E7EB",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "13px", fontWeight: 700,
                      color: isActive ? "#1A1A00" : isCompleted ? "#92400E" : "#9CA3AF",
                      transition: "all 0.3s", flexShrink: 0,
                      boxShadow: isActive ? "0 2px 8px rgba(255,205,44,0.4)" : "none",
                    }}>
                      {isCompleted ? "✓" : s.id === logoStep
                        ? <img src={TTTLogo} alt="" style={{ width: "22px", height: "22px", borderRadius: "50%", objectFit: "contain" }} />
                        : s.id}
                    </div>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div style={{ width: "20px", height: "2px", background: isCompleted ? "#FBBF24" : "#E5E7EB", borderRadius: "2px", transition: "background 0.3s" }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* NOTICES */}
        {stepNotice && (
          <div style={{ background: "#FFFBEB", border: "1.5px solid #FCD34D", borderRadius: "12px", padding: "10px 16px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#92400E", fontWeight: 500 }}>
            ✅ {stepNotice}
          </div>
        )}
        {message && (
          <div style={{ background: "#ECFDF5", border: "1.5px solid #6EE7B7", borderRadius: "12px", padding: "10px 16px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#065F46", fontWeight: 500 }}>
            🎉 {message}
          </div>
        )}
        {error && (
          <div style={{ background: "#FEF2F2", border: "1.5px solid #FCA5A5", borderRadius: "12px", padding: "10px 16px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#991B1B", fontWeight: 500 }}>
            ⚠️ {error}
          </div>
        )}

        {/* MAIN CARD */}
        <div style={{ background: "#FFFFFF", borderRadius: "20px", border: "1.5px solid #F3F4F6", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", overflow: "hidden" }}>

          {/* Step Header */}
          <div style={{ background: "linear-gradient(90deg, #FFFBEB, #FFF8DC)", borderBottom: "1.5px solid #FDE68A", padding: "14px 24px", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ fontSize: "22px" }}>{currentStep?.icon}</div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>{currentStep?.title}</div>
              <div style={{ fontSize: "11px", color: "#6B7280" }}>{currentStep?.subtitle}</div>
            </div>
          </div>

          <div style={{ padding: "24px" }}>

            {/* ─── STEP 1 ─── */}
            {step === 1 && (
              <div>
                <Card style={{ background: "#FFFBEB", borderColor: "#FDE68A", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ fontSize: "20px", marginTop: "2px" }}>🔒</div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#111827", marginBottom: "4px" }}>User Verification Required</div>
                      <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.6 }}>
                        Use the same name and WhatsApp number you provided in <strong>Form A</strong>. If they do not match, you will be redirected to the payment page.
                      </div>
                    </div>
                  </div>
                </Card>
                <FieldGroup style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
                  <div>
                    <Label required>Full Name</Label>
                    <Input
                      value={form.verification.fullName}
                      onChange={e => setField("verification.fullName", e.target.value)}
                      placeholder="Your full name"
                      invalid={showFieldErrors && isBlank(form.verification.fullName)}
                    />
                  </div>
                  <div>
                    <Label required>WhatsApp Number</Label>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={form.verification.whatsappNumber}
                      onChange={e => handleWhatsAppChange(e.target.value)}
                      placeholder="10 digit WhatsApp number"
                      invalid={showFieldErrors && String(form.verification.whatsappNumber || "").trim().length !== 10}
                    />
                    {form.verification.whatsappNumber && form.verification.whatsappNumber.length !== 10 && (
                      <p style={{ fontSize: "11px", color: "#EF4444", marginTop: "5px" }}>WhatsApp number must be exactly 10 digits.</p>
                    )}
                    {isVerificationMatch && (
                      <p style={{ fontSize: "11px", color: "#10B981", marginTop: "5px", fontWeight: 600 }}>✓ Details verified successfully</p>
                    )}
                  </div>
                </FieldGroup>
              </div>
            )}

            {/* ─── STEP 2 ─── */}
            {step === 2 && (
              <FieldGroup style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                <div>
                  <Label required>Your role</Label>
                  <Select value={accountRole} onChange={e => setAccountRole(e.target.value)}>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent</option>
                  </Select>
                  <p style={{ fontSize: "11px", color: "#6B7280", marginTop: "5px" }}>
                    Username prefix: <strong style={{ color: "#111827" }}>{usernamePrefix}</strong>
                  </p>
                </div>
                <div>
                  <Label required>Username</Label>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <div style={{ padding: "9px 12px", background: "#F9FAFB", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "13px", fontWeight: 700, color: "#374151", whiteSpace: "nowrap", userSelect: "none" }}>
                      {usernamePrefix}
                    </div>
                    <Input
                      value={form.account.username}
                      onChange={e => setField("account.username", e.target.value)}
                      placeholder="Enter your username"
                      style={{ borderColor: usernameBorderColor, boxShadow: usernameStatus.state !== "idle" ? `0 0 0 3px ${usernameBorderColor}25` : "none" }}
                      invalid={showFieldErrors && isBlank(form.account.username)}
                    />
                  </div>
                  {usernameStatus.message && (
                    <p style={{ fontSize: "11px", color: usernameStatusColor, marginTop: "5px", fontWeight: 500 }}>{usernameStatus.message}</p>
                  )}
                </div>
                <div>
                  <Label required>Password</Label>
                  <PasswordInput
                    value={form.account.password}
                    onChange={e => setField("account.password", e.target.value)}
                    placeholder="Minimum 6 characters"
                    show={showPassword}
                    onToggle={() => setShowPassword(p => !p)}
                    invalid={showFieldErrors && (isBlank(form.account.password) || form.account.password.length < 6)}
                  />
                </div>
                <div>
                  <Label required>Confirm Password</Label>
                  <PasswordInput
                    value={form.account.confirmPassword}
                    onChange={e => setField("account.confirmPassword", e.target.value)}
                    placeholder="Re-enter password"
                    show={showConfirmPassword}
                    onToggle={() => setShowConfirmPassword(p => !p)}
                    invalid={showFieldErrors && (isBlank(form.account.confirmPassword) || form.account.password !== form.account.confirmPassword)}
                  />
                  {form.account.confirmPassword && form.account.password !== form.account.confirmPassword && (
                    <p style={{ fontSize: "11px", color: "#EF4444", marginTop: "5px" }}>Passwords do not match.</p>
                  )}
                  {form.account.confirmPassword && form.account.password === form.account.confirmPassword && form.account.password && (
                    <p style={{ fontSize: "11px", color: "#10B981", marginTop: "5px", fontWeight: 600 }}>✓ Passwords match</p>
                  )}
                </div>
              </FieldGroup>
            )}

            {/* ─── STEP 3 ─── */}
            {step === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <FieldGroup style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
                  <div>
                    <Label required>Gmail Address</Label>
                    <Input
                      type="email"
                      value={form.contact.email}
                      onChange={e => setField("contact.email", e.target.value)}
                      placeholder="student@gmail.com"
                      invalid={showFieldErrors && isBlank(form.contact.email)}
                    />
                  </div>
                  <div>
                    <Label required>Date of Birth</Label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1.2fr", gap: "8px" }}>
                      <Select value={dobParts.day} onChange={e => updateDobPart("day", e.target.value)} invalid={showFieldErrors && !dobParts.day}>
                        <option value="">Day</option>
                        {dobDayOptions.map(day => (
                          <option key={day} value={day}>{Number(day)}</option>
                        ))}
                      </Select>
                      <Select value={dobParts.month} onChange={e => updateDobPart("month", e.target.value)} invalid={showFieldErrors && !dobParts.month}>
                        <option value="">Month</option>
                        {dobMonthOptions.map(month => (
                          <option key={month.value} value={month.value}>{month.label}</option>
                        ))}
                      </Select>
                      <Select value={dobParts.year} onChange={e => updateDobPart("year", e.target.value)} invalid={showFieldErrors && !dobParts.year}>
                        <option value="">Year</option>
                        {dobYearOptions.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label required>Country</Label>
                    <Select value={form.contact.country} onChange={e => setField("contact.country", e.target.value)}>
                      <option value="India">🇮🇳 India</option>
                      <option value="Other"> Other</option>
                    </Select>
                  </div>
                </FieldGroup>
                {form.contact.country === "Other" && (
                  <div style={{ maxWidth: "320px" }}>
                    <Label required>Country Name</Label>
                    <Input
                      value={form.contact.countryOther}
                      onChange={e => setField("contact.countryOther", e.target.value)}
                      placeholder="Enter your country"
                      invalid={showFieldErrors && isBlank(form.contact.countryOther)}
                    />
                  </div>
                )}
                {form.contact.country === "India" && (
                  <FieldGroup style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                    <div>
                      <Label required>State</Label>
                      <Select value={form.contact.state} onChange={e => { setField("contact.state", e.target.value); setField("contact.district", ""); }} invalid={showFieldErrors && isBlank(form.contact.state)}>
                        <option value="">Select State</option>
                        {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </Select>
                    </div>
                    <div>
                      <Label required>District</Label>
                      <Select value={form.contact.district} onChange={e => setField("contact.district", e.target.value)} disabled={!form.contact.state} invalid={showFieldErrors && isBlank(form.contact.district)}>
                        <option value="">Select District</option>
                        {districtOptions.map(d => <option key={d} value={d}>{d}</option>)}
                        <option value="Other">Other</option>
                      </Select>
                    </div>
                    <div>
                      <Label>Pin Code (optional)</Label>
                      <Input
                        value={form.contact.pinCode}
                        onChange={e => handlePinCodeChange(e.target.value)}
                        placeholder="6-digit pin code"
                        maxLength={6}
                        inputMode="numeric"
                      />
                    </div>
                  </FieldGroup>
                )}
                {form.contact.district === "Other" && (
                  <div style={{ maxWidth: "320px" }}>
                    <Label required>District Name</Label>
                    <Input
                      value={form.contact.districtOther}
                      onChange={e => setField("contact.districtOther", e.target.value)}
                      placeholder="Enter district name"
                      invalid={showFieldErrors && isBlank(form.contact.districtOther)}
                    />
                  </div>
                )}
                <FieldGroup style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
                  <div>
                    <Label required>Gender</Label>
                    <Select value={form.contact.gender} onChange={e => setField("contact.gender", e.target.value)} invalid={showFieldErrors && isBlank(form.contact.gender)}>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Others">Others</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Full Address (optional)</Label>
                    <Input value={form.contact.address} onChange={e => handleAddressChange(e.target.value)} placeholder="Full home address" />
                  </div>
                </FieldGroup>
              </div>
            )}

            {/* ─── STEP 4 ─── */}
            {step === 4 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <FieldGroup style={{ gridTemplateColumns: "1fr 2fr" }}>
                  <div>
                    <Label required>School is in?</Label>
                    <Select value={form.school.country} onChange={e => setField("school.country", e.target.value)}>
                      <option value="India">🇮🇳 India</option>
                      <option value="Other"> Other</option>
                    </Select>
                  </div>
                  <div>
                    <Label required>School Name</Label>
                    <Input
                      value={form.school.name}
                      onChange={e => setField("school.name", e.target.value)}
                      placeholder="School name"
                      invalid={showFieldErrors && isBlank(form.school.name)}
                    />
                  </div>
                </FieldGroup>
                {form.school.country === "Other" && (
                  <div style={{ maxWidth: "320px" }}>
                    <Label required>Country Name</Label>
                    <Input
                      value={form.school.countryOther}
                      onChange={e => setField("school.countryOther", e.target.value)}
                      placeholder="Country name"
                      invalid={showFieldErrors && isBlank(form.school.countryOther)}
                    />
                  </div>
                )}
                {form.school.country === "India" && (
                  <FieldGroup style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                    <div>
                      <Label required>State</Label>
                      <Select value={form.school.state} onChange={e => { setField("school.state", e.target.value); setField("school.district", ""); }} invalid={showFieldErrors && isBlank(form.school.state)}>
                        <option value="">Select State</option>
                        {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </Select>
                    </div>
                    <div>
                      <Label>District (optional)</Label>
                      <Select value={form.school.district} onChange={e => setField("school.district", e.target.value)} disabled={!form.school.state}>
                        <option value="">Select District</option>
                        {schoolDistrictOptions.map(d => <option key={d} value={d}>{d}</option>)}
                        <option value="Other">Other</option>
                      </Select>
                    </div>
                    <div>
                      <Label>Pin Code (optional)</Label>
                      <Input value={form.school.pinCode} onChange={e => setField("school.pinCode", e.target.value)} placeholder="Pin code" maxLength={6} />
                    </div>
                  </FieldGroup>
                )}
                {form.school.district === "Other" && (
                  <div style={{ maxWidth: "320px" }}>
                    <Label required>District Name</Label>
                    <Input
                      value={form.school.districtOther}
                      onChange={e => setField("school.districtOther", e.target.value)}
                      placeholder="District name"
                      invalid={showFieldErrors && isBlank(form.school.districtOther)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ─── STEP 5 ─── */}
            {step === 5 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                {[
                  { key: "father", label: "Father", icon: "👨" },
                  { key: "mother", label: "Mother", icon: "👩" },
                ].map(({ key, label, icon }) => (
                  <Card key={key} style={{ borderColor: "#FDE68A" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", paddingBottom: "12px", borderBottom: "1px solid #F3F4F6" }}>
                      <span style={{ fontSize: "20px" }}>{icon}</span>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{label} Details</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div>
                        <Label required>{label} Name</Label>
                        <Input
                          value={form.parents[key].name}
                          onChange={e => setField(`parents.${key}.name`, e.target.value)}
                          placeholder={`${label} name`}
                          invalid={showFieldErrors && isBlank(form.parents[key].name)}
                        />
                      </div>
                      <div>
                        <Label required>{label} Phone Number</Label>
                        <Input
                          value={form.parents[key].phone}
                          onChange={e => setField(`parents.${key}.phone`, e.target.value)}
                          placeholder="Mobile number"
                          invalid={showFieldErrors && isBlank(form.parents[key].phone)}
                        />
                      </div>
                      <div>
                        <Label>Gmail (optional)</Label>
                        <Input value={form.parents[key].email} onChange={e => setField(`parents.${key}.email`, e.target.value)} placeholder="Email address" />
                      </div>
                      <div>
                        <Label>Profession (optional)</Label>
                        <Input value={form.parents[key].profession} onChange={e => setField(`parents.${key}.profession`, e.target.value)} placeholder="Job or business" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* ─── STEP 6 ─── */}
            {step === 6 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ maxWidth: "200px" }}>
                  <Label required>Number of Siblings</Label>
                  <Select
                    value={form.siblings.count}
                    onChange={e => setField("siblings.count", Number(e.target.value))}
                    invalid={showFieldErrors && (!Number.isFinite(Number(form.siblings.count)) || Number(form.siblings.count) < 1)}
                  >
                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Sibling{n > 1 ? "s" : ""}</option>)}
                  </Select>
                </div>
                {form.siblings.details.map((sibling, idx) => (
                  <Card key={`sib-${idx}`} style={{ borderColor: "#FDE68A" }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "linear-gradient(135deg, #FFCD2C, #E0AC00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "#1A1A00" }}>{idx + 1}</div>
                      Sibling {idx + 1}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
                      <div>
                        <Label required>Name</Label>
                        <Input
                          value={sibling.name}
                          onChange={e => { const next = [...form.siblings.details]; next[idx] = { ...next[idx], name: e.target.value }; setField("siblings.details", next); }}
                          placeholder={`Sibling ${idx + 1} name`}
                          invalid={showFieldErrors && isBlank(sibling.name)}
                        />
                      </div>
                      <div>
                        <Label required>Age</Label>
                        <Input
                          value={sibling.age}
                          onChange={e => { const next = [...form.siblings.details]; next[idx] = { ...next[idx], age: e.target.value }; setField("siblings.details", next); }}
                          placeholder="Age"
                          invalid={showFieldErrors && isBlank(sibling.age)}
                        />
                      </div>
                      <div>
                        <Label required>Education</Label>
                        <Select
                          value={sibling.class}
                          onChange={e => { const next = [...form.siblings.details]; next[idx] = { ...next[idx], class: e.target.value }; setField("siblings.details", next); }}
                          invalid={showFieldErrors && isBlank(sibling.class)}
                        >
                          <option value="">Select Class</option>
                          {SIBLING_CLASS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </Select>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* ─── STEP 7 ─── */}
            {step === 7 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <Card style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
                  <div style={{ fontSize: "13px", color: "#6B7280", marginBottom: "16px", lineHeight: 1.6 }}>
                    Stay connected with True Topper! Follow our social channels to get the latest updates. <em>(Optional)</em>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px" }}>
                    {SOCIAL_LINKS.map(link => {
                      const Icon = link.icon;
                      return (
                        <a key={link.id} href={link.href} target="_blank" rel="noreferrer"
                          style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderRadius: "12px", background: link.bg, border: `1.5px solid ${link.color}30`, textDecoration: "none", color: link.color, fontWeight: 600, fontSize: "13px", transition: "transform 0.2s, box-shadow 0.2s" }}
                          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 4px 12px ${link.color}30`; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                          <Icon style={{ fontSize: "18px" }} />
                          {link.label}
                        </a>
                      );
                    })}
                  </div>
                </Card>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "14px 16px", borderRadius: "12px", border: "1.5px solid #FDE68A", background: form.social.followed ? "#FFFBEB" : "#FFFFFF", transition: "background 0.2s" }}>
                  <input type="checkbox" checked={form.social.followed} onChange={e => setField("social.followed", e.target.checked)} style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#FFCD2C" }} />
                  <span style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>
                    ✅ I have followed all True Topper social channels
                  </span>
                </label>
              </div>
            )}

            {/* ─── FOOTER BUTTONS ─── */}
            <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1.5px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1 || loading}
                style={{ padding: "10px 22px", borderRadius: "10px", border: "1.5px solid #E5E7EB", background: "#FFFFFF", fontSize: "13px", fontWeight: 600, color: step === 1 ? "#D1D5DB" : "#374151", cursor: step === 1 ? "not-allowed" : "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => { if (step !== 1 && !loading) { e.target.style.borderColor = "#FBBF24"; e.target.style.background = "#FFFBEB"; } }}
                onMouseLeave={e => { e.target.style.borderColor = "#E5E7EB"; e.target.style.background = "#FFFFFF"; }}
              >
                ← Back
              </button>

              {step < STEPS.length ? (
                showPaymentRedirect ? (
                  <button
                    type="button"
                    onClick={() => redirectToPayment("Name and WhatsApp number must match Form A.")}
                    style={{ padding: "10px 28px", borderRadius: "10px", background: "linear-gradient(135deg, #F59E0B, #D97706)", border: "none", fontSize: "13px", fontWeight: 700, color: "#FFFFFF", cursor: "pointer", boxShadow: "0 2px 8px rgba(217,119,6,0.3)" }}
                  >
                    Go to Payment →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={(step === 1 && !isVerificationMatch) || loading}
                    style={{
                      padding: "10px 28px", borderRadius: "10px", border: "none", fontSize: "13px", fontWeight: 700,
                      background: (step === 1 && !isVerificationMatch) || loading ? "#E5E7EB" : "linear-gradient(135deg, #FFCD2C, #E0AC00)",
                      color: (step === 1 && !isVerificationMatch) || loading ? "#9CA3AF" : "#1A1A00",
                      cursor: (step === 1 && !isVerificationMatch) || loading ? "not-allowed" : "pointer",
                      boxShadow: (step === 1 && !isVerificationMatch) || loading ? "none" : "0 2px 10px rgba(255,205,44,0.4)",
                      transition: "all 0.2s"
                    }}
                  >
                    {loading ? "Loading..." : "Continue →"}
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    padding: "10px 32px", borderRadius: "10px", border: "none", fontSize: "13px", fontWeight: 700,
                    background: loading ? "#E5E7EB" : "linear-gradient(135deg, #FFCD2C, #E0AC00)",
                    color: loading ? "#9CA3AF" : "#1A1A00",
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: loading ? "none" : "0 2px 10px rgba(255,205,44,0.4)",
                    transition: "all 0.2s"
                  }}
                >
                  {loading ? "⏳ Submitting..." : "🎉 Final Submit"}
                </button>
              )}
            </div>

          </div>
        </div>

        {/* FOOTER NOTE */}
        <div style={{ textAlign: "center", marginTop: "16px", fontSize: "12px", color: "#9CA3AF" }}>
          Step {step} of {STEPS.length} • True Topper Registration Form B
        </div>

      </div>
    </div>
  );
}
