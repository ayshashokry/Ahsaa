import React, { useState } from "react";
import ReactJoyride, {
  STATUS,
  ACTIONS,
  EVENTS,
  LIFECYCLE,
} from "react-joyride";
let helpSteps = [
  {
    target: ".navMainHelp",
    content: "الصفحة الرئيسية",
    disableBeacon: true,
  },
  {
    target: ".navSearchHelp",
    content: "أنواع البحث (عام-احداثيات-اقرب موقع)",
  },
  {
    target: ".navFavHelp",
    content: "حصر المواقع الأستثمارية التي تم تفضيلها",
  },
  {
    target: ".navUpdateLocationHelp",
    content: "حصر وتعديل الموقع",
  },
  {
    target: ".navFeasStudyHelp",
    content: "دراسة جدوى أولية",
  },
  {
    target: ".navReportsHelp",
    content: "تقارير",
  },
  {
    target: ".navDashboardHelp",
    content: "لوحة الإحصائيات",
  },
  {
    target: ".navContactHelp",
    content: "جهات الأتصال للمساعدة والدعم الفني",
  },
  {
    target: ".navAdminHelp",
    content: "إدارة النظام",
  },

  {
    target: ".headerSavePrintHelp",
    content: "حفظ صورة من الخريطة او طباعتها",
  },
  {
    target: ".headerLayersHelp",
    content: "تحديد الطبقات المراد اظهارها على الخريطة",
  },
  {
    target: ".headermapGalleryHelp",
    content: "تغيير  نوع الأظهار الجغرافي ",
  },
  {
    target: ".headerInquiryHelp",
    content: "اظهار بيانات المواقع الأستثمارية",
  },
  {
    target: ".headerFavHelp",
    content: "تحديد وحفظ مواقع استثمارية بالمفضلة",
  },
  {
    target: ".headerGoogleHelp",
    content: "اظهار المواقع الأستثمارية على جوجل ماب",
  },
  { target: ".headerHelpIcon", content: "مساعدة" },
  {
    target: ".mapFullExHelp",
    content: "العودة الى الوضع الأفتراضي للخريطة",
  },
  {
    target: ".mapZoomInHelp",
    content: "تكبير الخريطة",
  },
  {
    target: ".mapZoomOutHelp",
    content: "تصغير الخريطة",
  },
  {
    target: ".mapPrevHelp",
    content: "اظهار وضع سابق في الخريطة",
  },
  {
    target: ".mapNextHelp",
    content: "اظهار وضع لاحق في الخريطة",
  },

  {
    target: ".mapPanHelp",
    content: "ملاحة الخريطة وتحريكها",
  },
  {
    target: ".mapSelectHelp",
    content: "تحديد المواقع الأستثمارية",
  },
  {
    target: ".mapRemoveSelectHelp",
    content: "الغاء تحديد المواقع الأستثمارية",
  },
  {
    target: ".mapStopSelectHelp",
    content: "إيقاف التحديد",
  },
  {
    target: ".mapShowInfoHelp",
    content: "عرض بيانات المواقع الاستثمارية",
  },
];
export default function MainPageHelp() {
  const [firstTimeClass, setFirstTimeClass] = useState("helpFirstTime");
  const handleJoyrideCallback = (data) => {
    const { status, type, action } = data;
    if ([EVENTS.TOUR_END].includes(type)) {
      localStorage.setItem("showHelp", true);
      setFirstTimeClass("");
    }
    if ([LIFECYCLE.COMPLETE].includes(type)) {
      localStorage.setItem("showHelp", true);
      setFirstTimeClass("");
    }
    if ([STATUS.SKIPPED].includes(status)) {
      localStorage.setItem("showHelp", true);
      setFirstTimeClass("");
    }
    if ([ACTIONS.CLOSE].includes(action)) {
      localStorage.setItem("showHelp", true);
      setFirstTimeClass("");
    }
  };
  return (
    <div>
      <ReactJoyride
        locale={{
          back: "السابق",
          close: "إغلاق",
          last: "الأخيرة",
          next: "التالي",
        }}
        callback={handleJoyrideCallback}
        steps={helpSteps}
        disableCloseOnEsc
        run={true}
        continuous
        showProgress
        disableOverlayClose
        showSkipButton
        styles={{
          options: {
            arrowColor: "rgba(255, 255, 255, .9)",
            backgroundColor: "rgba(255, 255, 255, .9)",
            overlayColor: "rgba(31, 75, 89, .4)",
            primaryColor: "#000",
            textColor: "#1f4b59",
            zIndex: 9000000,
          },
        }}
      />
    </div>
  );
}
