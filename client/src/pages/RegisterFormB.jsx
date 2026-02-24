import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkUsernameAvailability, submitFormB } from "../api";
import { FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import TTTLogo from "../assets/images/TTTlogo- rigiterions.png";
import Navbar from "../components/layout/Navbar";

const INDIA_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

// Full India districts list
const DISTRICTS_BY_STATE = {
  "Andhra Pradesh": [
    "Anantapur",
    "Chittoor",
    "East Godavari",
    "Guntur",
    "Krishna",
    "Kurnool",
    "Prakasam",
    "Srikakulam",
    "Sri Potti Sriramulu Nellore",
    "Visakhapatnam",
    "Vizianagaram",
    "West Godavari",
    "YSR Kadapa",
  ],
  "Arunachal Pradesh": [
    "Anjaw",
    "Changlang",
    "Dibang Valley",
    "East Kameng",
    "East Siang",
    "Kurung Kumey",
    "Lohit",
    "Lower Dibang Valley",
    "Lower Subansiri",
    "Papum Pare",
    "Tawang",
    "Tirap",
    "Upper Siang",
    "Upper Subansiri",
    "West Kameng",
    "West Siang",
  ],
  Assam: [
    "Baksa",
    "Barpeta",
    "Bongaigaon",
    "Cachar",
    "Chirang",
    "Darrang",
    "Dhemaji",
    "Dhubri",
    "Dibrugarh",
    "Goalpara",
    "Golaghat",
    "Hailakandi",
    "Jorhat",
    "Kamrup",
    "Kamrup Metropolitan",
    "Karbi Anglong",
    "Karimganj",
    "Kokrajhar",
    "Lakhimpur",
    "Morigaon",
    "Nagaon",
    "Nalbari",
    "Sivasagar",
    "Sonitpur",
    "Tinsukia",
    "Udalguri",
  ],
  Bihar: [
    "Araria",
    "Arwal",
    "Aurangabad",
    "Banka",
    "Begusarai",
    "Bhagalpur",
    "Bhojpur",
    "Buxar",
    "Darbhanga",
    "East Champaran",
    "Gaya",
    "Gopalganj",
    "Jamui",
    "Jehanabad",
    "Kaimur",
    "Katihar",
    "Khagaria",
    "Kishanganj",
    "Lakhisarai",
    "Madhepura",
    "Madhubani",
    "Munger",
    "Muzaffarpur",
    "Nalanda",
    "Nawada",
    "Patna",
    "Purnia",
    "Rohtas",
    "Saharsa",
    "Samastipur",
    "Saran",
    "Sheikhpura",
    "Sheohar",
    "Sitamarhi",
    "Siwan",
    "Supaul",
    "Vaishali",
    "West Champaran",
  ],
  Chhattisgarh: [
    "Balod",
    "Baloda Bazar",
    "Balrampur",
    "Bastar",
    "Bemetara",
    "Bijapur",
    "Bilaspur",
    "Dantewada",
    "Dhamtari",
    "Durg",
    "Gariaband",
    "Janjgir-Champa",
    "Jashpur",
    "Kabirdham",
    "Kanker",
    "Kondagaon",
    "Korba",
    "Koriya",
    "Mahasamund",
    "Mungeli",
    "Narayanpur",
    "Raigarh",
    "Raipur",
    "Rajnandgaon",
    "Sukma",
    "Surajpur",
    "Surguja",
  ],
  Goa: ["North Goa", "South Goa"],
  Gujarat: [
    "Ahmedabad",
    "Amreli",
    "Anand",
    "Aravalli",
    "Banaskantha",
    "Bharuch",
    "Bhavnagar",
    "Botad",
    "Chhota Udaipur",
    "Dahod",
    "Dang",
    "Devbhumi Dwarka",
    "Gandhinagar",
    "Gir Somnath",
    "Jamnagar",
    "Junagadh",
    "Kheda",
    "Kutch",
    "Mahisagar",
    "Mehsana",
    "Morbi",
    "Narmada",
    "Navsari",
    "Panchmahal",
    "Patan",
    "Porbandar",
    "Rajkot",
    "Sabarkantha",
    "Surat",
    "Surendranagar",
    "Tapi",
    "Vadodara",
    "Valsad",
  ],
  Haryana: [
    "Ambala",
    "Bhiwani",
    "Charkhi Dadri",
    "Faridabad",
    "Fatehabad",
    "Gurugram",
    "Hisar",
    "Jhajjar",
    "Jind",
    "Kaithal",
    "Karnal",
    "Kurukshetra",
    "Mahendragarh",
    "Nuh",
    "Palwal",
    "Panchkula",
    "Panipat",
    "Rewari",
    "Rohtak",
    "Sirsa",
    "Sonipat",
    "Yamunanagar",
  ],
  "Himachal Pradesh": [
    "Bilaspur",
    "Chamba",
    "Hamirpur",
    "Kangra",
    "Kinnaur",
    "Kullu",
    "Lahaul and Spiti",
    "Mandi",
    "Shimla",
    "Sirmaur",
    "Solan",
    "Una",
  ],
  Jharkhand: [
    "Bokaro",
    "Chatra",
    "Deoghar",
    "Dhanbad",
    "Dumka",
    "East Singhbhum",
    "Garhwa",
    "Giridih",
    "Godda",
    "Gumla",
    "Hazaribag",
    "Jamtara",
    "Khunti",
    "Koderma",
    "Latehar",
    "Lohardaga",
    "Pakur",
    "Palamu",
    "Ramgarh",
    "Ranchi",
    "Sahibganj",
    "Seraikela Kharsawan",
    "Simdega",
    "West Singhbhum",
  ],
  Karnataka: [
    "Bagalkot",
    "Ballari",
    "Belagavi",
    "Bengaluru Rural",
    "Bengaluru Urban",
    "Bidar",
    "Chamarajanagar",
    "Chikkaballapur",
    "Chikkamagaluru",
    "Chitradurga",
    "Dakshina Kannada",
    "Davanagere",
    "Dharwad",
    "Gadag",
    "Hassan",
    "Haveri",
    "Kalaburagi",
    "Kodagu",
    "Kolar",
    "Koppal",
    "Mandya",
    "Mysuru",
    "Raichur",
    "Ramanagara",
    "Shivamogga",
    "Tumakuru",
    "Udupi",
    "Uttara Kannada",
    "Vijayapura",
    "Yadgir",
  ],
  Kerala: [
    "Alappuzha",
    "Ernakulam",
    "Idukki",
    "Kannur",
    "Kasaragod",
    "Kollam",
    "Kottayam",
    "Kozhikode",
    "Malappuram",
    "Palakkad",
    "Pathanamthitta",
    "Thiruvananthapuram",
    "Thrissur",
    "Wayanad",
  ],
  "Madhya Pradesh": [
    "Agar Malwa",
    "Alirajpur",
    "Anuppur",
    "Ashoknagar",
    "Balaghat",
    "Barwani",
    "Betul",
    "Bhind",
    "Bhopal",
    "Burhanpur",
    "Chhatarpur",
    "Chhindwara",
    "Damoh",
    "Datia",
    "Dewas",
    "Dhar",
    "Dindori",
    "Guna",
    "Gwalior",
    "Harda",
    "Hoshangabad",
    "Indore",
    "Jabalpur",
    "Jhabua",
    "Katni",
    "Khandwa",
    "Khargone",
    "Mandla",
    "Mandsaur",
    "Morena",
    "Narsinghpur",
    "Neemuch",
    "Panna",
    "Raisen",
    "Rajgarh",
    "Ratlam",
    "Rewa",
    "Sagar",
    "Satna",
    "Sehore",
    "Seoni",
    "Shahdol",
    "Shajapur",
    "Sheopur",
    "Shivpuri",
    "Sidhi",
    "Singrauli",
    "Tikamgarh",
    "Ujjain",
    "Umaria",
    "Vidisha",
  ],
  Maharashtra: [
    "Ahmednagar",
    "Akola",
    "Amravati",
    "Aurangabad",
    "Beed",
    "Bhandara",
    "Buldhana",
    "Chandrapur",
    "Dhule",
    "Gadchiroli",
    "Gondia",
    "Hingoli",
    "Jalgaon",
    "Jalna",
    "Kolhapur",
    "Latur",
    "Mumbai City",
    "Mumbai Suburban",
    "Nagpur",
    "Nanded",
    "Nandurbar",
    "Nashik",
    "Osmanabad",
    "Palghar",
    "Parbhani",
    "Pune",
    "Raigad",
    "Ratnagiri",
    "Sangli",
    "Satara",
    "Sindhudurg",
    "Solapur",
    "Thane",
    "Wardha",
    "Washim",
    "Yavatmal",
  ],
  Manipur: [
    "Bishnupur",
    "Chandel",
    "Churachandpur",
    "Imphal East",
    "Imphal West",
    "Senapati",
    "Tamenglong",
    "Thoubal",
    "Ukhrul",
  ],
  Meghalaya: [
    "East Garo Hills",
    "East Jaintia Hills",
    "East Khasi Hills",
    "North Garo Hills",
    "Ri Bhoi",
    "South Garo Hills",
    "South West Garo Hills",
    "South West Khasi Hills",
    "West Garo Hills",
    "West Jaintia Hills",
    "West Khasi Hills",
  ],
  Mizoram: [
    "Aizawl",
    "Champhai",
    "Kolasib",
    "Lawngtlai",
    "Lunglei",
    "Mamit",
    "Saiha",
    "Serchhip",
  ],
  Nagaland: [
    "Dimapur",
    "Kiphire",
    "Kohima",
    "Longleng",
    "Mokokchung",
    "Mon",
    "Peren",
    "Phek",
    "Tuensang",
    "Wokha",
    "Zunheboto",
  ],
  Odisha: [
    "Angul",
    "Balangir",
    "Balasore",
    "Bargarh",
    "Bhadrak",
    "Boudh",
    "Cuttack",
    "Deogarh",
    "Dhenkanal",
    "Gajapati",
    "Ganjam",
    "Jagatsinghpur",
    "Jajpur",
    "Jharsuguda",
    "Kalahandi",
    "Kandhamal",
    "Kendrapara",
    "Kendujhar",
    "Khordha",
    "Koraput",
    "Malkangiri",
    "Mayurbhanj",
    "Nabarangpur",
    "Nayagarh",
    "Nuapada",
    "Puri",
    "Rayagada",
    "Sambalpur",
    "Subarnapur",
    "Sundargarh",
  ],
  Punjab: [
    "Amritsar",
    "Barnala",
    "Bathinda",
    "Faridkot",
    "Fatehgarh Sahib",
    "Fazilka",
    "Ferozepur",
    "Gurdaspur",
    "Hoshiarpur",
    "Jalandhar",
    "Kapurthala",
    "Ludhiana",
    "Malerkotla",
    "Mansa",
    "Moga",
    "Pathankot",
    "Patiala",
    "Rupnagar",
    "Sahibzada Ajit Singh Nagar",
    "Sangrur",
    "Shaheed Bhagat Singh Nagar",
    "Sri Muktsar Sahib",
    "Tarn Taran",
  ],
  Rajasthan: [
    "Ajmer",
    "Alwar",
    "Banswara",
    "Baran",
    "Barmer",
    "Bharatpur",
    "Bhilwara",
    "Bikaner",
    "Bundi",
    "Chittorgarh",
    "Churu",
    "Dausa",
    "Dholpur",
    "Dungarpur",
    "Hanumangarh",
    "Jaipur",
    "Jaisalmer",
    "Jalore",
    "Jhalawar",
    "Jhunjhunu",
    "Jodhpur",
    "Karauli",
    "Kota",
    "Nagaur",
    "Pali",
    "Pratapgarh",
    "Rajsamand",
    "Sawai Madhopur",
    "Sikar",
    "Sirohi",
    "Sri Ganganagar",
    "Tonk",
    "Udaipur",
  ],
  Sikkim: ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
  "Tamil Nadu": [
    "Ariyalur",
    "Chennai",
    "Coimbatore",
    "Cuddalore",
    "Dharmapuri",
    "Dindigul",
    "Erode",
    "Kanchipuram",
    "Kanyakumari",
    "Karur",
    "Krishnagiri",
    "Madurai",
    "Nagapattinam",
    "Namakkal",
    "Perambalur",
    "Pudukkottai",
    "Ramanathapuram",
    "Salem",
    "Sivaganga",
    "Thanjavur",
    "The Nilgiris",
    "Theni",
    "Thiruvallur",
    "Thiruvarur",
    "Thoothukudi",
    "Tiruchirappalli",
    "Tirunelveli",
    "Tiruppur",
    "Tiruvannamalai",
    "Vellore",
    "Viluppuram",
    "Virudhunagar",
  ],
  Telangana: [
    "Adilabad",
    "Bhadradri Kothagudem",
    "Hyderabad",
    "Jagtial",
    "Jangaon",
    "Jayashankar Bhupalapally",
    "Jogulamba Gadwal",
    "Kamareddy",
    "Karimnagar",
    "Khammam",
    "Komaram Bheem Asifabad",
    "Mahabubabad",
    "Mahabubnagar",
    "Mancherial",
    "Medak",
    "Medchal–Malkajgiri",
    "Nagarkurnool",
    "Nalgonda",
    "Nirmal",
    "Nizamabad",
    "Peddapalli",
    "Rajanna Sircilla",
    "Ranga Reddy",
    "Sangareddy",
    "Siddipet",
    "Suryapet",
    "Vikarabad",
    "Wanaparthy",
    "Warangal Rural",
    "Warangal Urban",
    "Yadadri Bhuvanagiri",
  ],
  Tripura: [
    "Dhalai",
    "Gomati",
    "Khowai",
    "North Tripura",
    "Sepahijala",
    "South Tripura",
    "Unakoti",
    "West Tripura",
  ],
  "Uttar Pradesh": [
    "Agra",
    "Aligarh",
    "Prayagraj",
    "Ambedkar Nagar",
    "Amethi",
    "Amroha",
    "Auraiya",
    "Azamgarh",
    "Baghpat",
    "Bahraich",
    "Ballia",
    "Balrampur",
    "Banda",
    "Barabanki",
    "Bareilly",
    "Basti",
    "Bhadohi",
    "Bijnor",
    "Budaun",
    "Bulandshahr",
    "Chandauli",
    "Chitrakoot",
    "Deoria",
    "Etah",
    "Etawah",
    "Ayodhya",
    "Farrukhabad",
    "Fatehpur",
    "Firozabad",
    "Gautam Buddha Nagar",
    "Ghaziabad",
    "Ghazipur",
    "Gonda",
    "Gorakhpur",
    "Hamirpur",
    "Hapur",
    "Hardoi",
    "Hathras",
    "Jalaun",
    "Jaunpur",
    "Jhansi",
    "Kannauj",
    "Kanpur Dehat",
    "Kanpur Nagar",
    "Kasganj",
    "Kaushambi",
    "Kushinagar",
    "Lakhimpur Kheri",
    "Lalitpur",
    "Lucknow",
    "Maharajganj",
    "Mahoba",
    "Mainpuri",
    "Mathura",
    "Mau",
    "Meerut",
    "Mirzapur",
    "Moradabad",
    "Muzaffarnagar",
    "Pilibhit",
    "Pratapgarh",
    "Raebareli",
    "Rampur",
    "Saharanpur",
    "Sambhal",
    "Sant Kabir Nagar",
    "Shahjahanpur",
    "Shamli",
    "Shravasti",
    "Siddharth Nagar",
    "Sitapur",
    "Sonbhadra",
    "Sultanpur",
    "Unnao",
    "Varanasi",
  ],
  Uttarakhand: [
    "Almora",
    "Bageshwar",
    "Chamoli",
    "Champawat",
    "Dehradun",
    "Haridwar",
    "Nainital",
    "Pauri Garhwal",
    "Pithoragarh",
    "Rudraprayag",
    "Tehri Garhwal",
    "Udham Singh Nagar",
    "Uttarkashi",
  ],
  "West Bengal": [
    "Alipurduar",
    "Bankura",
    "Birbhum",
    "Cooch Behar",
    "Dakshin Dinajpur",
    "Darjeeling",
    "Hooghly",
    "Howrah",
    "Jalpaiguri",
    "Jhargram",
    "Kalimpong",
    "Kolkata",
    "Malda",
    "Murshidabad",
    "Nadia",
    "North 24 Parganas",
    "Paschim Bardhaman",
    "Paschim Medinipur",
    "Purba Bardhaman",
    "Purba Medinipur",
    "Purulia",
    "South 24 Parganas",
    "Uttar Dinajpur",
  ],
  "Andaman and Nicobar Islands": [
    "Nicobar",
    "North and Middle Andaman",
    "South Andaman",
  ],
  Chandigarh: ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": [
    "Dadra and Nagar Haveli",
    "Daman",
    "Diu",
  ],
  Delhi: [
    "Central Delhi",
    "East Delhi",
    "New Delhi",
    "North Delhi",
    "North East Delhi",
    "North West Delhi",
    "Shahdara",
    "South Delhi",
    "South East Delhi",
    "South West Delhi",
    "West Delhi",
  ],
  "Jammu and Kashmir": [
    "Anantnag",
    "Bandipora",
    "Baramulla",
    "Budgam",
    "Doda",
    "Ganderbal",
    "Jammu",
    "Kathua",
    "Kishtwar",
    "Kulgam",
    "Kupwara",
    "Poonch",
    "Pulwama",
    "Rajouri",
    "Ramban",
    "Reasi",
    "Samba",
    "Shopian",
    "Srinagar",
    "Udhampur",
  ],
  Ladakh: ["Kargil", "Leh"],
  Lakshadweep: ["Lakshadweep"],
  Puducherry: ["Karaikal", "Mahe", "Puducherry", "Yanam"],
};

const SOCIAL_LINKS = [
  {
    id: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/@TheTrueTopper",
    icon: FaYoutube,
    color: "bg-red-50 text-red-600",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/thetruetopperpvtltd/",
    icon: FaInstagram,
    color: "bg-pink-50 text-pink-600",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/thetruetopper/posts/?feedView=all",
    icon: FaLinkedin,
    color: "bg-blue-50 text-blue-700",
  },
];

const STEPS = [
  { id: 1, title: "User Verification", subtitle: "Confirm your basic details" },
  {
    id: 2,
    title: "Create Username & Password",
    subtitle: "Set your credentials",
  },
  { id: 3, title: "Contact Details", subtitle: "Personal information" },
  { id: 4, title: "School Details", subtitle: "School information" },
  { id: 5, title: "Parents Details", subtitle: "Father & Mother details" },
  { id: 6, title: "Siblings", subtitle: "Family details" },
  {
    id: 7,
    title: "Follow True Topper",
    subtitle: "Optional social follow",
  },
];

const SIBLING_CLASS_OPTIONS = [
  "10th",
  "11th",
  "12th",
  "Diploma",
  "BA",
  "BCom",
  "BSc",
  "BCA",
  "BCS",
  "Other",
];

const buildSiblingDetails = (count) =>
  Array.from({ length: count }, () => ({ name: "", age: "", class: "" }));

export default function RegisterFormB() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [logoStep, setLogoStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [stepNotice, setStepNotice] = useState("");
  const [logoSpin, setLogoSpin] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState({
    state: "idle",
    message: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [expectedVerification, setExpectedVerification] = useState({
    name: "",
    mobile: "",
  });

  const [form, setForm] = useState({
    verification: {
      fullName: "",
      whatsappNumber: "",
    },
    account: {
      username: "",
      password: "",
      confirmPassword: "",
    },
    contact: {
      email: "",
      dob: "",
      country: "India",
      countryOther: "",
      state: "",
      district: "",
      districtOther: "",
      pinCode: "",
      gender: "",
      address: "",
    },
    school: {
      country: "India",
      countryOther: "",
      name: "",
      state: "",
      district: "",
      districtOther: "",
      pinCode: "",
    },
    parents: {
      father: { name: "", phone: "", email: "", profession: "" },
      mother: { name: "", phone: "", email: "", profession: "" },
    },
    siblings: {
      count: 1,
      details: buildSiblingDetails(1),
    },
    social: {
      followed: false,
    },
  });

  const districtOptions = useMemo(
    () => DISTRICTS_BY_STATE[form.contact.state] || [],
    [form.contact.state]
  );

  const schoolDistrictOptions = useMemo(
    () => DISTRICTS_BY_STATE[form.school.state] || [],
    [form.school.state]
  );

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
    if (!stepNotice) return;
    const id = setTimeout(() => setStepNotice(""), 1600);
    return () => clearTimeout(id);
  }, [stepNotice]);

  useEffect(() => {
    const storedName = String(localStorage.getItem("formAName") || "").trim();
    const storedMobile = String(
      localStorage.getItem("formAMobile") || ""
    ).trim();
    setExpectedVerification({ name: storedName, mobile: storedMobile });
    if (!storedName || !storedMobile) {
      setMessage("");
      showError("Form A details not found. Please proceed to payment.");
      setTimeout(() => navigate("/payment"), 800);
    }
  }, [navigate]);

  useEffect(() => {
    const username = String(form.account.username || "").trim();
    if (!username) {
      setUsernameStatus({ state: "idle", message: "" });
      return;
    }

    if (username.length < 3) {
      setUsernameStatus({
        state: "invalid",
        message: "Username must be at least 3 characters.",
      });
      return;
    }

    let cancelled = false;
    setUsernameStatus({ state: "checking", message: "Checking availability..." });

    const timer = setTimeout(async () => {
      try {
        const res = await checkUsernameAvailability({ username });
        if (cancelled) return;
        if (res?.success === false) {
          setUsernameStatus({
            state: "error",
            message: res?.message || "Unable to verify username right now.",
          });
          return;
        }
        if (res?.available) {
          setUsernameStatus({
            state: "available",
            message: "Username available.",
          });
        } else {
          setUsernameStatus({
            state: "taken",
            message: "Username already taken.",
          });
        }
      } catch (err) {
        if (cancelled) return;
        setUsernameStatus({
          state: "error",
          message: "Unable to verify username right now.",
        });
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form.account.username]);

  const setField = (path, value) => {
    setForm((prev) => {
      const next = { ...prev };
      const keys = path.split(".");
      let cur = next;
      for (let i = 0; i < keys.length - 1; i += 1) {
        const key = keys[i];
        cur[key] = { ...cur[key] };
        cur = cur[key];
      }
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleWhatsAppChange = (value) => {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 10);
    setField("verification.whatsappNumber", digits);
  };

  const normalizeName = (value) => String(value || "").trim().toLowerCase();
  const normalizeMobile = (value) => String(value || "").replace(/\D/g, "");
  const expectedName = normalizeName(expectedVerification.name);
  const expectedMobile = normalizeMobile(expectedVerification.mobile);
  const enteredName = normalizeName(form.verification.fullName);
  const enteredMobile = normalizeMobile(form.verification.whatsappNumber);
  const isWhatsAppValid = enteredMobile.length === 10;
  const hasExpectedVerification = Boolean(expectedName && expectedMobile);
  const hasEnteredVerification = Boolean(enteredName && isWhatsAppValid);
  const isVerificationMatch =
    hasExpectedVerification &&
    enteredName === expectedName &&
    enteredMobile === expectedMobile;
  const showPaymentRedirect =
    step === 1 && hasEnteredVerification && !isVerificationMatch;
  const usernameTone =
    usernameStatus.state === "available"
      ? "border-emerald-300 ring-1 ring-emerald-100"
      : usernameStatus.state === "taken" ||
        usernameStatus.state === "invalid" ||
        usernameStatus.state === "error"
      ? "border-rose-300 ring-1 ring-rose-100"
      : usernameStatus.state === "checking"
      ? "border-amber-300 ring-1 ring-amber-100"
      : "border-slate-200";

  const triggerLogoSpin = () => {
    setLogoSpin(true);
    setTimeout(() => setLogoSpin(false), 1400);
  };

  const showError = (text) => {
    setError(text);
    if (text) triggerLogoSpin();
  };

  const redirectToPayment = (note) => {
    setMessage("");
    showError(note);
    setTimeout(() => navigate("/payment"), 800);
  };

  const validateStep = (current) => {
    if (current === 1) {
      if (!form.verification.fullName.trim()) return "Full name is required.";
      if (!form.verification.whatsappNumber.trim())
        return "WhatsApp number is required.";
      if (form.verification.whatsappNumber.trim().length !== 10)
        return "WhatsApp number must be exactly 10 digits.";
    }

    if (current === 2) {
      if (!form.account.username.trim()) return "Username is required.";
      if (usernameStatus.state === "checking")
        return "Please wait, checking username availability.";
      if (usernameStatus.state === "taken") return "Username already taken.";
      if (usernameStatus.state === "invalid")
        return usernameStatus.message || "Username is invalid.";
      if (usernameStatus.state === "error")
        return "Unable to verify username. Please try again.";
      if (!form.account.password.trim()) return "Password is required.";
      if (form.account.password.length < 6)
        return "Password must be at least 6 characters.";
      if (!form.account.confirmPassword.trim())
        return "Confirm password is required.";
      if (form.account.password !== form.account.confirmPassword)
        return "Passwords do not match.";
    }

    if (current === 3) {
      const contact = form.contact;
      if (!contact.email.trim()) return "Gmail is required.";
      if (!contact.dob.trim()) return "DOB is required.";
      if (!contact.country) return "Country is required.";
      if (contact.country === "Other" && !contact.countryOther.trim()) {
        return "Country name is required.";
      }
      if (contact.country === "India") {
        if (!contact.state) return "State is required.";
        if (!contact.district) return "District is required.";
        if (contact.district === "Other" && !contact.districtOther.trim()) {
          return "District name is required.";
        }
      }
      if (!contact.gender) return "Gender is required.";
    }

    if (current === 4) {
      const school = form.school;
      if (!school.country) return "School country is required.";
      if (!school.name.trim()) return "School name is required.";
      if (school.country === "Other" && !school.countryOther.trim()) {
        return "School country is required.";
      }
      if (school.country === "India") {
        if (!school.state) return "School state is required.";
        if (school.district === "Other" && !school.districtOther.trim()) {
          return "School district name is required.";
        }
      }
    }

    if (current === 5) {
      const { father, mother } = form.parents;
      if (!father.name.trim()) return "Father name is required.";
      if (!father.phone.trim()) return "Father mobile number is required.";
      if (!mother.name.trim()) return "Mother name is required.";
      if (!mother.phone.trim()) return "Mother mobile number is required.";
    }

    if (current === 6) {
      const count = Number(form.siblings.count || 0);
      if (!Number.isFinite(count) || count < 1)
        return "Number of siblings is required.";
      for (let i = 0; i < count; i += 1) {
        const sibling = form.siblings.details[i];
        if (!sibling?.name?.trim())
          return `Sibling ${i + 1} name is required.`;
        if (!sibling?.age?.trim())
          return `Sibling ${i + 1} age is required.`;
        if (!sibling?.class?.trim())
          return `Sibling ${i + 1} class is required.`;
      }
    }

    return "";
  };

  const goToStepWithLogo = (target) => {
    setLoading(true);
    setTimeout(() => {
      setLogoStep(target);
      setStep(target);
      setLoading(false);
    }, 350);
  };

  const handleNext = () => {
    const issue = validateStep(step);
    if (issue) {
      showError(issue);
      return;
    }

    if (step === 1) {
      if (!hasExpectedVerification) {
        redirectToPayment("Form A details not found. Please proceed to payment.");
        return;
      }
      if (!isVerificationMatch) {
        redirectToPayment(
          "Name and WhatsApp number must match Form A. Redirecting to payment..."
        );
        return;
      }
    }

    setError("");
    setStepNotice(`Step ${step} completed. Continue to the next step.`);
    triggerLogoSpin();

    const next = Math.min(step + 1, STEPS.length);
    goToStepWithLogo(next);
  };

  const handleBack = () => {
    setError("");
    const prev = Math.max(step - 1, 1);
    goToStepWithLogo(prev);
  };

  const handleSubmit = async () => {
    if (!hasExpectedVerification) {
      redirectToPayment("Form A details not found. Please proceed to payment.");
      return;
    }
    if (!isVerificationMatch) {
      redirectToPayment(
        "Name and WhatsApp number must match Form A. Redirecting to payment..."
      );
      return;
    }
    const issue = validateStep(step);
    if (issue) {
      showError(issue);
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const contactCountry =
      form.contact.country === "Other"
        ? form.contact.countryOther
        : form.contact.country;
    const schoolCountry =
      form.school.country === "Other"
        ? form.school.countryOther
        : form.school.country;

    const payload = {
      ...form,
      account: {
        username: form.account.username,
        password: form.account.password,
      },
      contact: {
        ...form.contact,
        country: contactCountry,
        district:
          form.contact.district === "Other"
            ? form.contact.districtOther
            : form.contact.district,
      },
      school: {
        ...form.school,
        country: schoolCountry,
        district:
          form.school.district === "Other"
            ? form.school.districtOther
            : form.school.district,
      },
    };

    try {
      const res = await submitFormB(payload);
      if (!res?.success) {
        showError(res?.message || "Submission failed.");
        setLoading(false);
        return;
      }
      setMessage("Form B submitted successfully. Redirecting...");
      triggerLogoSpin();
      setTimeout(() => navigate("/student"), 1000);
    } catch (err) {
      showError(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const currentStep = STEPS.find((s) => s.id === step);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9E6] via-white to-[#FFF3C4]">
      <Navbar onStudentLoginClick={() => navigate("/login")} />

      {/* FULL WIDTH, RESPONSIVE FORM */}
      <div className="w-full px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="w-full">
          <div className="rounded-3xl bg-white/95 shadow-2xl border border-amber-100 overflow-hidden">
            {/* HEADER */}
            <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-amber-100 bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00] text-slate-900">
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-white/70 bg-white/80 p-1 shadow-md flex items-center justify-center">
                    <img
                      src={TTTLogo}
                      alt="True Topper"
                      className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
                    />
                  </div>
                  <div>
                    <h1 className="text-base sm:text-lg md:text-xl font-semibold">
                      Student Registration Form (Form B)
                    </h1>
                    <p className="text-[10px] sm:text-xs text-slate-700 mt-0.5">
                      Step {step} of {STEPS.length} • {currentStep?.title}
                    </p>
                  </div>
                </div>
                <div className="hidden sm:block text-[10px] uppercase tracking-widest text-slate-700">
                  True Topper
                </div>
              </div>
            </div>

            {/* BODY */}
            <div className="px-3 sm:px-5 lg:px-6 py-4 sm:py-5">
              {/* STEP CYCLE WITH MOVING LOGO */}
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                  {STEPS.map((s, idx) => {
                    const isActive = s.id === step;
                    const isLogoHere = s.id === logoStep;
                    const isCompleted = s.id < step;

                    return (
                      <div key={s.id} className="flex items-center gap-2">
                        <div
                          className={`
                            relative flex items-center justify-center
                            h-8 w-8 sm:h-9 sm:w-9 rounded-full transition-all duration-500
                            ${
                              isActive
                                ? "bg-slate-900 text-white scale-110 shadow-md ring-2 ring-amber-200"
                                : isCompleted
                                ? "bg-amber-200 text-amber-900"
                                : "bg-white text-slate-400 border border-amber-200"
                            }
                          `}
                        >
                          {isLogoHere ? (
                            <img
                              src={TTTLogo}
                              alt="True Topper"
                              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border border-amber-200 bg-white shadow-sm"
                            />
                          ) : (
                            <span className="text-[11px] font-bold">
                              {s.id}
                            </span>
                          )}
                        </div>

                        <div className="hidden md:flex flex-col">
                          <span
                            className={`
                              text-[10px] font-semibold transition-colors duration-500
                              ${
                                isActive
                                  ? "text-slate-900"
                                  : isCompleted
                                  ? "text-amber-700"
                                  : "text-slate-400"
                              }
                            `}
                          >
                            {s.title}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {isActive ? `Step ${s.id}` : ""}
                          </span>
                        </div>

                        {idx < STEPS.length - 1 && (
                          <span className="hidden sm:block h-px w-5 sm:w-6 bg-amber-200" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* NOTICES */}
              {stepNotice && (
                <div className="mb-2.5 sm:mb-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-[11px] text-amber-800 flex items-center gap-2">
                  <img
                    src={TTTLogo}
                    alt="Step Completed"
                    className="h-5 w-5 sm:h-6 sm:w-6 rounded-full border border-white/70 bg-white p-1"
                  />
                  <span>{stepNotice}</span>
                </div>
              )}

              {message && (
                <div className="mb-2.5 sm:mb-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700 flex items-center gap-2">
                  <img
                    src={TTTLogo}
                    alt="Success"
                    className="h-5 w-5 sm:h-6 sm:w-6 rounded-full border border-white/70 bg-white p-1"
                  />
                  <span>{message}</span>
                </div>
              )}

              {error && (
                <div className="mb-2.5 sm:mb-3 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-[11px] text-rose-700 flex items-center gap-2">
                  <img
                    src={TTTLogo}
                    alt="Error"
                    className="h-5 w-5 sm:h-6 sm:w-6 rounded-full border border-white/70 bg-white p-1"
                  />
                  <span>{error}</span>
                </div>
              )}

              {/* STEP CONTENTS */}
              {step === 1 && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-amber-100 bg-white/80 px-3 py-2.5 shadow-sm">
                    <div className="relative">
                      <img
                        src={TTTLogo}
                        alt="True Topper"
                        className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-amber-100 bg-white p-1.5 shadow-sm"
                      />
                      {isVerificationMatch && (
                        <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-white" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xs sm:text-sm font-semibold text-slate-900">
                        User Verification
                      </h2>
                      <p className="text-[10px] sm:text-[11px] text-slate-600">
                        Same Name and WhatsApp number use karo jo Form A me diya
                        hai.
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-[10px] sm:text-[11px] text-amber-800">
                    Details match na hone par aapko payment page par redirect
                    kiya jayega.
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700">
                        Name<span className="text-rose-500">*</span>
                      </label>
                      <input
                        className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                        value={form.verification.fullName}
                        onChange={(e) =>
                          setField("verification.fullName", e.target.value)
                        }
                        placeholder="Student full name"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700">
                        WhatsApp Number
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        pattern="[0-9]{10}"
                        className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                        value={form.verification.whatsappNumber}
                        onChange={(e) => handleWhatsAppChange(e.target.value)}
                        placeholder="10 digit WhatsApp number"
                      />
                      {form.verification.whatsappNumber &&
                        form.verification.whatsappNumber.length !== 10 && (
                          <p className="mt-1 text-[10px] text-rose-600">
                            WhatsApp number must be exactly 10 digits.
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700">
                      Username<span className="text-rose-500">*</span>
                    </label>
                    <input
                      className={`mt-1 w-full rounded-xl border px-2.5 py-1.5 text-xs ${usernameTone}`}
                      value={form.account.username}
                      onChange={(e) =>
                        setField("account.username", e.target.value)
                      }
                      placeholder="Username"
                    />
                    {usernameStatus.message && (
                      <p
                        className={`mt-1 text-[10px] ${
                          usernameStatus.state === "available"
                            ? "text-emerald-600"
                            : usernameStatus.state === "checking"
                            ? "text-amber-600"
                            : "text-rose-600"
                        }`}
                      >
                        {usernameStatus.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700">
                      Password<span className="text-rose-500">*</span>
                    </label>
                    <div className="relative mt-1">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 pr-9 text-xs"
                        value={form.account.password}
                        onChange={(e) =>
                          setField("account.password", e.target.value)
                        }
                        placeholder="Password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 3l18 18" />
                            <path d="M10.5 10.5a2 2 0 0 0 2.9 2.9" />
                            <path d="M9.9 5.1a9.9 9.9 0 0 1 2.1-.2c6 0 9.8 7 9.8 7a18.4 18.4 0 0 1-3.1 4.3" />
                            <path d="M6.2 6.2A18.4 18.4 0 0 0 2.2 12s3.8 7 9.8 7a9.9 9.9 0 0 0 4.3-.9" />
                          </svg>
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1.5 12s4.5-7 10.5-7 10.5 7 10.5 7-4.5 7-10.5 7S1.5 12 1.5 12z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700">
                      Confirm Password
                      <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative mt-1">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 pr-9 text-xs"
                        value={form.account.confirmPassword}
                        onChange={(e) =>
                          setField("account.confirmPassword", e.target.value)
                        }
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600"
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                      >
                        {showConfirmPassword ? (
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 3l18 18" />
                            <path d="M10.5 10.5a2 2 0 0 0 2.9 2.9" />
                            <path d="M9.9 5.1a9.9 9.9 0 0 1 2.1-.2c6 0 9.8 7 9.8 7a18.4 18.4 0 0 1-3.1 4.3" />
                            <path d="M6.2 6.2A18.4 18.4 0 0 0 2.2 12s3.8 7 9.8 7a9.9 9.9 0 0 0 4.3-.9" />
                          </svg>
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1.5 12s4.5-7 10.5-7 10.5 7 10.5 7-4.5 7-10.5 7S1.5 12 1.5 12z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700">
                        Gmail<span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                        value={form.contact.email}
                        onChange={(e) =>
                          setField("contact.email", e.target.value)
                        }
                        placeholder="student@gmail.com"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700">
                        DOB<span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                        value={form.contact.dob}
                        onChange={(e) =>
                          setField("contact.dob", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700">
                        Are you from?<span className="text-rose-500">*</span>
                      </label>
                      <select
                        className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                        value={form.contact.country}
                        onChange={(e) =>
                          setField("contact.country", e.target.value)
                        }
                      >
                        <option value="India">India</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {form.contact.country === "Other" && (
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700">
                        Country Name<span className="text-rose-500">*</span>
                      </label>
                      <input
                        className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                        value={form.contact.countryOther}
                        onChange={(e) =>
                          setField("contact.countryOther", e.target.value)
                        }
                        placeholder="Country name"
                      />
                    </div>
                  )}

                  {form.contact.country === "India" && (
                    <div className="grid gap-3 md:grid-cols-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700">
                          State<span className="text-rose-500">*</span>
                        </label>
                        <select
                          className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                          value={form.contact.state}
                          onChange={(e) =>
                            setField("contact.state", e.target.value)
                          }
                        >
                          <option value="">Select state</option>
                          {INDIA_STATES.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700">
                          District<span className="text-rose-500">*</span>
                        </label>
                        <select
                          className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                          value={form.contact.district}
                          onChange={(e) =>
                            setField("contact.district", e.target.value)
                          }
                        >
                          <option value="">Select district</option>
                          {districtOptions.map((dist) => (
                            <option key={dist} value={dist}>
                              {dist}
                            </option>
                          ))}
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700">
                          Pin Code (optional)
                        </label>
                        <input
                          className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                          value={form.contact.pinCode}
                          onChange={(e) =>
                            setField("contact.pinCode", e.target.value)
                          }
                          placeholder="Pin code"
                        />
                      </div>
                    </div>
                  )}

                  {form.contact.district === "Other" && (
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700">
                        District Name<span className="text-rose-500">*</span>
                      </label>
                      <input
                        className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                        value={form.contact.districtOther}
                        onChange={(e) =>
                          setField("contact.districtOther", e.target.value)
                        }
                        placeholder="District name"
                      />
                    </div>
                  )}

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700">
                        Gender<span className="text-rose-500">*</span>
                      </label>
                      <select
                        className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                        value={form.contact.gender}
                        onChange={(e) =>
                          setField("contact.gender", e.target.value)
                        }
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700">
                        Full Address (optional)
                      </label>
                      <input
                        className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                        value={form.contact.address}
                        onChange={(e) =>
                          setField("contact.address", e.target.value)
                        }
                        placeholder="Full address"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700">
                        Your school is in?
                        <span className="text-rose-500">*</span>
                      </label>
                      <select
                        className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                        value={form.school.country}
                        onChange={(e) =>
                          setField("school.country", e.target.value)
                        }
                      >
                        <option value="India">India</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[11px] font-semibold text-slate-700">
                        School Name<span className="text-rose-500">*</span>
                      </label>
                      <input
                        className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                        value={form.school.name}
                        onChange={(e) =>
                          setField("school.name", e.target.value)
                        }
                        placeholder="School name"
                      />
                    </div>
                  </div>

                  {form.school.country === "Other" && (
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700">
                        Country Name<span className="text-rose-500">*</span>
                      </label>
                      <input
                        className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                        value={form.school.countryOther}
                        onChange={(e) =>
                          setField("school.countryOther", e.target.value)
                        }
                        placeholder="Country name"
                      />
                    </div>
                  )}

                  {form.school.country === "India" && (
                    <div className="grid gap-3 md:grid-cols-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700">
                          State<span className="text-rose-500">*</span>
                        </label>
                        <select
                          className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                          value={form.school.state}
                          onChange={(e) =>
                            setField("school.state", e.target.value)
                          }
                        >
                          <option value="">Select state</option>
                          {INDIA_STATES.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700">
                          District (optional)
                        </label>
                        <select
                          className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                          value={form.school.district}
                          onChange={(e) =>
                            setField("school.district", e.target.value)
                          }
                        >
                          <option value="">Select district</option>
                          {schoolDistrictOptions.map((dist) => (
                            <option key={dist} value={dist}>
                              {dist}
                            </option>
                          ))}
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700">
                          Pin Code (optional)
                        </label>
                        <input
                          className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                          value={form.school.pinCode}
                          onChange={(e) =>
                            setField("school.pinCode", e.target.value)
                          }
                          placeholder="Pin code"
                        />
                      </div>
                    </div>
                  )}

                  {form.school.district === "Other" && (
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700">
                        District Name<span className="text-rose-500">*</span>
                      </label>
                      <input
                        className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                        value={form.school.districtOther}
                        onChange={(e) =>
                          setField("school.districtOther", e.target.value)
                        }
                        placeholder="District name"
                      />
                    </div>
                  )}
                </div>
              )}

              {step === 5 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 p-3">
                    <h3 className="text-xs font-semibold text-slate-800 mb-2">
                      Father Details
                    </h3>
                    <div className="space-y-2">
                      <input
                        className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                        placeholder="Father name*"
                        value={form.parents.father.name}
                        onChange={(e) =>
                          setField("parents.father.name", e.target.value)
                        }
                      />
                      <input
                        className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                        placeholder="Father phone number*"
                        value={form.parents.father.phone}
                        onChange={(e) =>
                          setField("parents.father.phone", e.target.value)
                        }
                      />
                      <input
                        className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                        placeholder="Father Gmail (optional)"
                        value={form.parents.father.email}
                        onChange={(e) =>
                          setField("parents.father.email", e.target.value)
                        }
                      />
                      <input
                        className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                        placeholder="Father profession (optional)"
                        value={form.parents.father.profession}
                        onChange={(e) =>
                          setField(
                            "parents.father.profession",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-3">
                    <h3 className="text-xs font-semibold text-slate-800 mb-2">
                      Mother Details
                    </h3>
                    <div className="space-y-2">
                      <input
                        className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                        placeholder="Mother name*"
                        value={form.parents.mother.name}
                        onChange={(e) =>
                          setField("parents.mother.name", e.target.value)
                        }
                      />
                      <input
                        className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                        placeholder="Mother phone number*"
                        value={form.parents.mother.phone}
                        onChange={(e) =>
                          setField("parents.mother.phone", e.target.value)
                        }
                      />
                      <input
                        className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                        placeholder="Mother Gmail (optional)"
                        value={form.parents.mother.email}
                        onChange={(e) =>
                          setField("parents.mother.email", e.target.value)
                        }
                      />
                      <input
                        className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                        placeholder="Mother profession (optional)"
                        value={form.parents.mother.profession}
                        onChange={(e) =>
                          setField(
                            "parents.mother.profession",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-3">
                  <div className="max-w-xs">
                    <label className="text-[11px] font-semibold text-slate-700">
                      Number of Siblings<span className="text-rose-500">*</span>
                    </label>
                    <select
                      className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                      value={form.siblings.count}
                      onChange={(e) =>
                        setField("siblings.count", Number(e.target.value))
                      }
                    >
                      {[1, 2, 3, 4, 5, 6].map((count) => (
                        <option key={count} value={count}>
                          {count}
                        </option>
                      ))}
                    </select>
                  </div>

                  {form.siblings.details.length > 0 && (
                    <div className="space-y-3">
                      {form.siblings.details.map((sibling, idx) => (
                        <div
                          key={`sibling-${idx}`}
                          className="grid gap-2 md:grid-cols-3 rounded-2xl border border-slate-200 p-3"
                        >
                          <input
                            className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                            placeholder={`Sibling ${idx + 1} name*`}
                            value={sibling.name}
                            onChange={(e) => {
                              const next = [...form.siblings.details];
                              next[idx] = {
                                ...next[idx],
                                name: e.target.value,
                              };
                              setField("siblings.details", next);
                            }}
                          />
                          <input
                            className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                            placeholder="Age*"
                            value={sibling.age}
                            onChange={(e) => {
                              const next = [...form.siblings.details];
                              next[idx] = {
                                ...next[idx],
                                age: e.target.value,
                              };
                              setField("siblings.details", next);
                            }}
                          />
                          <select
                            className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
                            value={sibling.class}
                            onChange={(e) => {
                              const next = [...form.siblings.details];
                              next[idx] = {
                                ...next[idx],
                                class: e.target.value,
                              };
                              setField("siblings.details", next);
                            }}
                          >
                            <option value="">Select Education</option>
                            {SIBLING_CLASS_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === 7 && (
                <div className="space-y-3">
                  <div className="grid gap-2 sm:grid-cols-3">
                    {SOCIAL_LINKS.map((link) => {
                      const Icon = link.icon;
                      return (
                        <a
                          key={link.id}
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className={`flex items-center gap-1.5 rounded-2xl border border-amber-100 px-3 py-2 text-xs font-semibold ${link.color}`}
                        >
                          <Icon className="text-sm" />
                          {link.label}
                        </a>
                      );
                    })}
                  </div>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.social.followed}
                      onChange={(e) =>
                        setField("social.followed", e.target.checked)
                      }
                    />
                    I have followed all True Topper social channels (optional)
                  </label>
                </div>
              )}

              {/* FOOTER BUTTONS */}
              <div className="mt-5 sm:mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={step === 1 || loading}
                  className="rounded-xl border border-amber-200 px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white disabled:opacity-40"
                >
                  Back
                </button>
                {step < STEPS.length ? (
                  showPaymentRedirect ? (
                    <button
                      type="button"
                      onClick={() =>
                        redirectToPayment(
                          "Name and WhatsApp number must match Form A. Redirecting to payment..."
                        )
                      }
                      className="rounded-xl bg-amber-600 px-5 py-1.5 text-xs font-semibold text-white"
                    >
                      Go to Payment
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={(step === 1 && !isVerificationMatch) || loading}
                      className="rounded-xl bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00] px-5 py-1.5 text-xs font-semibold text-slate-900 shadow-md disabled:opacity-50"
                    >
                      Continue
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleSubmit}
                    className="rounded-xl bg-gradient-to-r from-[#FFCD2C] to-[#E0AC00] px-5 py-1.5 text-xs font-semibold text-slate-900 shadow-md disabled:opacity-60"
                  >
                    {loading ? "Submitting..." : "Final Submit"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
