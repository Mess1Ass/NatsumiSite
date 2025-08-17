import React, { useState } from "react";
import { Steps, Timeline } from "@douyinfe/semi-ui";
import "./About.css";

const About = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 照片路径
  const photos = [
    "/assets/About/公式照1.jpg",
    "/assets/About/公式照2.jpg",
  ];

  return (
    <div className="about-container">
      <h2 className="about-title">关于夏沫</h2>

      {/* 导航步骤条 */}
      <div className="navigation-container">
        <Steps type="nav" current={currentStep} className="steps-container">
          <Steps.Step title="个人介绍" status={currentStep >= 0 ? "finish" : "wait"} />
          <Steps.Step title="现任公式照" status={currentStep >= 1 ? "finish" : "wait"} />
          <Steps.Step title="发展经历" status={currentStep >= 2 ? "finish" : "wait"} />
        </Steps>

        {/* 下一页按钮 */}
        <div className="navigation-buttons">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`nav-button prev ${currentStep === 0 ? "disabled" : ""}`}
          >
            上一页
          </button>
          <button
            onClick={handleNext}
            disabled={currentStep === 2}
            className={`nav-button next ${currentStep === 2 ? "disabled" : ""}`}
          >
            下一页
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="content-container">
        {currentStep === 0 && (
          <div className="step-content">
            <h3 className="step-title">夏沫 (Natsumi)</h3>
            <div className="step-description">
              <p className="intro-line">您好 夏沫是我 Natsumi也是我 mirugumi的粉色担当🎀</p>
              <p className="intro-line">🎀生日是6月1日 儿童节 双子座 istj 💖</p>
              <p className="intro-line">所做的一切 都是为了成为理想中最好的自己</p>
              <p className="intro-line">🎀初次见面 请多多喜欢吧 (ﾉ)`ω´(ヾ)</p>
              <p className="intro-line">———————————— 🫧</p>
            </div>
            <div className="social-media-section">
              <h4 className="social-media-title">📱 社交媒体</h4>
              <a
                href="https://weibo.com/u/7739695181?tabtype=feed"
                target="_blank"
                rel="noopener noreferrer"
                className="weibo-link"
              >
                🐦 微博主页
              </a>
            </div>
          </div>
        )}

                 {currentStep === 1 && (
           <div className="step-content">
             <h3 className="step-title">最新公式照</h3>
             <div className="photos-container">
               {photos.map((src, index) => (
                 <div key={index} className="photo-item">
                   <img
                     src={src}
                     alt={`公式照${index + 1}`}
                     className="photo-image"
                   />
                 </div>
               ))}
             </div>
             
             <div className="photos-info">
               <div className="info-box">
                 <p className="info-text">
                   ✨ 最新公式照展示！
                 </p>
               </div>
             </div>
           </div>
         )}

         {currentStep === 2 && (
           <div className="step-content">
             <h3 className="step-title">发展经历</h3>
             <div className="timeline-container">
                               <Timeline mode="alternate">
                  <Timeline.Item
                    time="2023年9月14号"
                    color="pink"
                  >
                    <div className="timeline-content">
                      <h4>初披露</h4>
                      <p>成为采梦计划训练生 Natsumi～</p>
                    </div>
                  </Timeline.Item>
                  
                  <Timeline.Item
                    time="2023年9月23号"
                    color="hotpink"
                  >
                    <div className="timeline-content">
                      <h4>首次舞台</h4>
                      <p>舞台初披露 开启偶像之路</p>
                    </div>
                  </Timeline.Item>
                  
                  <Timeline.Item
                    time="2024年1月13号"
                    color="deeppink"
                  >
                    <div className="timeline-content">
                      <h4>加入Mirugumi</h4>
                      <p>成为Mirugumi正式成员！</p>
                    </div>
                  </Timeline.Item>
                  
                  <Timeline.Item
                    time="2024年6月1号"
                    color="lightpink"
                  >
                    <div className="timeline-content">
                      <h4>成为偶像后的生日</h4>
                      <p>成为偶像后的第一次生日 是否也在期待着拥有自己的那个生日SP呢~</p>
                    </div>
                  </Timeline.Item>

                  <Timeline.Item
                    time="2024年9月14号"
                    color="pink"
                  >
                    <div className="timeline-content">
                      <h4>出道一周年</h4>
                      <p>经历一整年的成长 应该更喜欢舞台上的自己了吧！</p>
                    </div>
                  </Timeline.Item>

                  <Timeline.Item
                    time="2025年1月13号"
                    color="hotpink"
                  >
                    <div className="timeline-content">
                      <h4>加入Mirugumi一周年</h4>
                      <p>这一年里虽然经历了人员变动 但也和Mirugumi的大家建立了很深的羁绊吧！</p>
                    </div>
                  </Timeline.Item>

                  <Timeline.Item
                    time="2025年6月1号"
                    color="lightpink"
                  >
                    <div className="timeline-content">
                      <h4>成为偶像后的第二个生日</h4>
                      <p>成为偶像后的第二次生日 这次有很多人给你应援了 越来越多的人喜欢你了 我想这就是成为偶像的意义吧</p>
                    </div>
                  </Timeline.Item>

                  <Timeline.Item
                    time="2025年6月7号"
                    color="deeppink"
                  >
                    <div className="timeline-content">
                      <h4>首次生日SP</h4>
                      <p>终于迎来了自己的生日SP 虽然只有短短的20分钟 但是望向台下的大家 心里一定很开心吧！</p>
                    </div>
                  </Timeline.Item>
                </Timeline>
             </div>
           </div>
         )}
      </div>
    </div>
  );
};

export default About;
