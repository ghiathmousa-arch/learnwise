import Image from "next/image";

export default function AuthBrandPanel() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-teal-wash p-14 lg:flex">
      <svg
        viewBox="0 0 400 600"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full opacity-50"
      >
        <defs>
          <pattern
            id="lw-nodes"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="20"
              y1="20"
              x2="60"
              y2="60"
              stroke="#1D6F5C"
              strokeWidth="1"
              opacity="0.35"
            />
            <line
              x1="60"
              y1="20"
              x2="20"
              y2="60"
              stroke="#1D6F5C"
              strokeWidth="1"
              opacity="0.35"
            />
            <line
              x1="20"
              y1="20"
              x2="60"
              y2="20"
              stroke="#1D6F5C"
              strokeWidth="1"
              opacity="0.35"
            />
            <circle cx="20" cy="20" r="3" fill="#1D6F5C" opacity="0.55" />
            <circle cx="60" cy="20" r="3" fill="#1D6F5C" opacity="0.55" />
            <circle cx="20" cy="60" r="2" fill="#1D6F5C" opacity="0.35" />
            <circle cx="60" cy="60" r="2" fill="#1D6F5C" opacity="0.35" />
          </pattern>
        </defs>
        <rect width="400" height="600" fill="url(#lw-nodes)" />
      </svg>

      <Image
        src="/learnwise-logo.png"
        alt="LearnWise"
        width={1162}
        height={319}
        className="relative h-9 w-auto self-start"
      />

      <div className="relative flex flex-col gap-4">
        <h3 className="max-w-[20ch] text-3xl leading-snug font-bold text-teal-deep">
          أهلًا بك. مسارك محفوظ في مكانه.
        </h3>
        <p className="max-w-[34ch] text-base leading-loose text-[#3F5A52]">
          سجّل الدخول لتكمل من حيث توقّفت، أو أنشئ حسابًا مجانيًا ودع
          المنصّة ترشّح لك أول درس.
        </p>
      </div>

      <div className="relative flex items-center gap-5 text-[13px] text-[#3F5A52]">
        <span>٢٤٠+ درسًا</span>
        <span className="h-3 w-px bg-teal-line" />
        <span>٨ مسارات</span>
        <span className="h-3 w-px bg-teal-line" />
        <span>بدون بطاقة بنكية</span>
      </div>
    </div>
  );
}
