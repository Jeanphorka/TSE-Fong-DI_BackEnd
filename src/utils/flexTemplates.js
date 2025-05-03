const formatDate = (iso) => {
  const date = new Date(iso);
  return date.toLocaleString("th-TH", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).replace(',', '').replace(' ', ' เวลา ');
};

  
  exports.generateTimelineFlex = (fullIssue) => {
    const transactionId = fullIssue.transaction_id;
    const statusUpdates = fullIssue.status_updates
      .filter(s => ["รอรับเรื่อง", "กำลังดำเนินการ", "เสร็จสิ้น"].includes(s.status))
      .sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));
  
    const statusColors = {
      "รอรับเรื่อง": "#8C181C",
      "กำลังดำเนินการ": "#FED04B",
      "เสร็จสิ้น": "#8CC63E"
    };
  
    const statusTextColors = {
      "รอรับเรื่อง": "#8C181C",
      "กำลังดำเนินการ": "#D69E2E",
      "เสร็จสิ้น": "#2F855A"
    };
  
    const timelineBoxes = statusUpdates.map((s, i) => {
      const isLast = i === statusUpdates.length - 1;
      return {
        type: "box",
        layout: "horizontal",
        spacing: "lg",
        contents: [
          {
            type: "box",
            layout: "vertical",
            width: "12px",
            justifyContent: "center",
            alignItems: "center",
            contents: [
              {
                type: "box",
                layout: "vertical",
                cornerRadius: "30px",
                height: "12px",
                width: "12px",
                borderColor: statusColors[s.status],
                borderWidth: "2px",
                backgroundColor: statusColors[s.status],
                contents: []
              },
              !isLast && {
                type: "box",
                layout: "vertical",
                height: "40px",
                width: "2px",
                backgroundColor: "#718096",
                contents: []
              }
            ].filter(Boolean)
          },
          {
            type: "box",
            layout: "vertical",
            spacing: "xs",
            contents: [
              {
                type: "text",
                text: s.status,
                size: "sm",
                weight: "bold",
                color: statusTextColors[s.status]
              },
              {
                type: "text",
                text: formatDate(s.updated_at),
                size: "xs",
                color: "#888888"
              },
              ...(s.description ? [{
                type: "text",
                text: `รายละเอียด: ${s.description}`,
                size: "sm",
                wrap: true
              }] : [])
            ]
          }
        ]
      };
    });
  
    const firstImage = fullIssue.status_updates.find(s => s.status === "รอรับเรื่อง" && s.images?.length > 0)?.images?.[0];
  
    return {
      type: "flex",
      altText: `สถานะแจ้งปัญหาของคุณอัปเดต`,
      contents: {
        type: "bubble",
        size: "mega",
        hero: firstImage
          ? {
              type: "image",
              url: firstImage,
              size: "full",
              aspectRatio: "20:13",
              aspectMode: "cover"
            }
          : undefined,
        body: {
          type: "box",
          layout: "vertical",
          spacing: "lg",
          contents: [
            {
              type: "text",
              text: "สถานะอัปเดต",
              weight: "bold",
              size: "xl",
              color: "#8C181C"
            },
            {
              type: "box",
              layout: "horizontal",
              spacing: "sm",
              alignItems: "center",
              contents: [
                {
                  type: "box",
                  layout: "vertical",
                  backgroundColor: statusColors[fullIssue.status] || "#FACC15",
                  cornerRadius: "md",
                  paddingAll: "5px",
                  contents: [
                    {
                      type: "text",
                      text: fullIssue.status,
                      size: "sm",
                      color: "#ffffff",
                      weight: "bold"
                    }
                  ],
                  alignItems: "center"
                },
                {
                  type: "text",
                  text: transactionId,
                  size: "sm",
                  color: "#718096",
                  margin: "md"
                }
              ]
            },
            {
              type: "box",
              layout: "vertical",
              spacing: "lg",
              margin: "xl",
              contents: timelineBoxes
            }
          ]
        },
        footer: {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: [
              {
                type: "button",
                style: "primary",
                action: {
                  type: "uri",
                  label: "ดูไทม์ไทม์การทำงาน",
                  uri: `https://tse-fongdi.vercel.app/UserPage/IssueTimeline/${fullIssue.id}`
                },
                color: "#8C181C"
              },
              ...(fullIssue.status === "เสร็จสิ้น"
                ? [{
                    type: "button",
                    style: "primary",
                    action: {
                      type: "uri",
                      label: "รีวิวการแก้ไขปัญหา",
                      uri: `https://tse-fongdi.vercel.app/UserPage/ReviewPage/${fullIssue.id}`
                    },
                    color: "#8CC63E"
                  }]
                : [])
            ]
          }
        }
    };
  };

  exports.generateReviewSubmittedFlex = (fullIssue) => {
    const {
      transaction_id = "-",
      title = "-",
      building = "-",
      floor = "-",
      room = "-",
      created_at = "-",
      review = 0,
      comment = "-",
    } = fullIssue;
  
    const beforeImage = fullIssue.status_updates.find(s => s.status === "รอรับเรื่อง" && s.images.length > 0)?.images[0];
    const afterImage = fullIssue.status_updates.filter(s => s.status === "เสร็จสิ้น" && s.images.length > 0).at(-1)?.images[0];
    const getStarImages = (scoreRaw) => {
      const score = Number(scoreRaw);
      const roundedScore = Math.round(score * 2) / 2; // ได้เลข .0 หรือ .5 เท่านั้น
      const full = Math.floor(roundedScore);
      const isHalf = Math.abs(roundedScore - full - 0.5) < 0.01; // ทนต่อ float error
      const half = isHalf ? 1 : 0;
      const empty = 5 - full - half;
      const stars = [];
    
      for (let i = 0; i < full; i++) {
        stars.push("https://fongdi.s3.ap-southeast-2.amazonaws.com/uploads/favorite+(1).png");
      }
      if (half) {
        stars.push("https://fongdi.s3.ap-southeast-2.amazonaws.com/uploads/favorite.png");
      }
      for (let i = 0; i < empty; i++) {
        stars.push("https://fongdi.s3.ap-southeast-2.amazonaws.com/uploads/favorite-empty.png"); // อัปโหลดเพิ่มถ้ายังไม่มี
      }
    
      return stars;
    };
    
  
    return {
      type: "flex",
      altText: "สรุปรีวิวการแก้ปัญหา",
      contents: {
        type: "bubble",
        size: "mega",
        hero: {
          type: "image",
          url: beforeImage,
          size: "full",
          aspectRatio: "20:13",
          aspectMode: "cover"
        },
        body: {
          type: "box",
          layout: "vertical",
          spacing: "lg",
          paddingAll: "16px",
          contents: [
            {
              type: "text",
              text: "รีวิวของคุณ",
              weight: "bold",
              size: "xl",
              color: "#8C181C"
            },
            {
              type: "box",
              layout: "horizontal",
              spacing: "sm",
              contents: [
                {
                  type: "box",
                  layout: "vertical",
                  backgroundColor: "#8CC63E",
                  cornerRadius: "md",
                  paddingAll: "5px",
                  contents: [
                    {
                      type: "text",
                      text: "เสร็จสิ้น",
                      size: "sm",
                      color: "#ffffff",
                      weight: "bold"
                    }
                  ],
                  alignItems: "center"
                },
                {
                  type: "text",
                  text: transaction_id,
                  size: "sm",
                  color: "#718096",
                  margin: "md"
                }
              ]
            },
            {
              type: "box",
              layout: "vertical",
              spacing: "md",
              contents: [
                {
                  type: "box",
                  layout: "baseline",
                  spacing: "sm",
                  contents: [
                    { type: "text", text: "ประเภท:", size: "sm", color: "#AAAAAA", flex: 2 },
                    { type: "text", text: title, size: "sm", color: "#333333", wrap: true, flex: 5 }
                  ]
                },
                {
                  type: "box",
                  layout: "baseline",
                  spacing: "sm",
                  contents: [
                    { type: "text", text: "สถานที่:", size: "sm", color: "#AAAAAA", flex: 2 },
                    {
                      type: "text",
                      text: `ตึก${building} ชั้น ${floor ?? "-"} ห้อง ${room ?? "-"}`,
                      size: "sm",
                      color: "#333333",
                      wrap: true,
                      flex: 5
                    }
                  ]
                },
                {
                  type: "box",
                  layout: "baseline",
                  spacing: "sm",
                  contents: [
                    { type: "text", text: "วันที่แจ้ง:", size: "sm", color: "#AAAAAA", flex: 2 },
                    {
                      type: "text",
                      text: formatDate(created_at),
                      size: "sm",
                      color: "#333333",
                      wrap: true,
                      flex: 5
                    }
                  ]
                }
              ]
            },
            {
              type: "text",
              text: "คะแนนของคุณ",
              weight: "bold",
              size: "md",
              color: "#4A5568",
              margin: "md",
              offsetTop: "sm"
            },
            {
              type: "box",
              layout: "horizontal",
              spacing: "sm",
              contents: [
                {
                  type: "image",
                  url: beforeImage ,
                  size: "full",
                  aspectMode: "cover",
                  aspectRatio: "1:1",
                  flex: 1
                },
                {
                  type: "image",
                  url: afterImage ,
                  size: "full",
                  aspectMode: "cover",
                  aspectRatio: "1:1",
                  flex: 1
                }
              ]
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "text",
                  text: "Before",
                  size: "xs",
                  align: "center",
                  color: "#666666",
                  flex: 1
                },
                {
                  type: "text",
                  text: "After",
                  size: "xs",
                  align: "center",
                  color: "#666666",
                  flex: 1
                }
              ],
              offsetTop: "-5px"
            },
            {
              type: "box",
              layout: "horizontal",
              spacing: "xs",
              justifyContent: "center",
              contents: getStarImages(review).map((url) => ({
                type: "image",
                url,
                size: "30px",
                align: "center",
                
              }))
            },
            ...(comment
              ? [
                {
                  type: "text",
                  text: `“${comment}”` ,
                  wrap: true,
                  margin: "md",
                  color: "#333333",
                  size: "sm",
                  align: "center"
                }
              ]
              : [])
          ]
        }
      }
    };
  };
    