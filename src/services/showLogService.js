// 演出日志API服务
import config from '../config';

const API_BASE_URL = config.API_BASE_URL;

// 获取所有演出日志
export const getAllShowLogs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/natsumi/getShowLogs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
      const data = await response.json();
      
      // 检查API返回的数据结构
      if (Array.isArray(data)) {
        // 直接返回数组格式
        return { success: true, data: data };
      } else if (data.success && data.data) {
        // 包装格式
        return { success: true, data: data.data };
      } else {
        return { success: false, error: 'API返回数据格式错误' };
      }
  } catch (error) {
    console.error('获取演出日志失败:', error);
    return { success: false, error: error.message };
  }
};

// 获取最早的演出日志
export const getEarliestShowLog = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/natsumi/getEarliestShowLog`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 检查API返回的数据结构
    if (Array.isArray(data)) {
      // 直接返回数组格式
      return { success: true, data: data };
    } else if (data.success && data.data) {
      // 包装格式
      return { success: true, data: data.data };
    } else {
      return { success: false, error: 'API返回数据格式错误' };
    }
  } catch (error) {
    console.error('获取最早演出日志失败:', error);
    return { success: false, error: error.message };
  }
};

// 添加演出日志
export const insertShowLog = async (showLogData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/natsumi/insertShowLog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(showLogData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error('添加演出日志失败:', error);
    return { success: false, error: error.message };
  }
};

// 更新演出日志
export const updateShowLog = async (showLogData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/natsumi/updateShowLog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(showLogData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error('更新演出日志失败:', error);
    return { success: false, error: error.message };
  }
};

// 删除演出日志
export const deleteShowLog = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/natsumi/deleteShowLog?id=${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error('删除演出日志失败:', error);
    return { success: false, error: error.message };
  }
};

// 数据转换函数：将API数据转换为前端需要的格式
export const transformShowLogData = (apiData) => {
  if (!apiData || !Array.isArray(apiData)) {
    return [];
  }
  
  const transformedData = [];
  
  apiData.forEach(item => {
    // 处理时间格式转换
    const startTime = formatTime(item.startTime);
    const endTime = formatTime(item.endTime);
    
    
    // 基础演出数据
    const basePerformance = {
      id: item._id || item.id,
      title: item.title || '未命名演出',
      time: startTime.time,
      endTime: endTime.time, // 格式化后的结束时间
      location: item.location || '地点待定',
      type: getPerformanceType(item.title),
      status: getPerformanceStatus(item.startTime, item.endTime),
      description: `${item.title} - ${item.location}`,
      members: ['夏沫'], // 默认成员，可以根据实际需求调整
      startTime: item.startTime, // 原始开始时间戳
      endTimeRaw: item.endTime // 原始结束时间戳
    };
    
    // 如果是暂休演出，需要为每一天生成记录
    if (item.title === '暂休' && item.endTime) {
      const startDate = new Date(item.startTime);
      const endDate = new Date(item.endTime);
      
      // 为每一天生成记录（无限时间）
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dateStr = formatTime(currentDate.getTime()).date;
        
        transformedData.push({
          ...basePerformance,
          date: dateStr,
          // 为暂休演出添加特殊标识
          isBreak: true,
          originalId: basePerformance.id,
          // 如果是开始日期，标记为原始记录（用于状态检测）
          isOriginal: dateStr === startTime.date
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } else {
      // 普通演出，只使用开始日期
      transformedData.push({
        ...basePerformance,
        date: startTime.date
      });
    }
  });
  
  return transformedData;
};

// 时间格式化辅助函数 - 专门处理毫秒时间戳，转换为东八区时间
const formatTime = (timeValue) => {
  if (!timeValue) {
    return { date: '', time: '' };
  }
  
  let date;
  
  // 如果是数字（毫秒时间戳），直接创建Date对象
  if (typeof timeValue === 'number') {
    date = new Date(timeValue);
  }
  // 如果是字符串，尝试解析
  else if (typeof timeValue === 'string') {
    date = new Date(timeValue);
  }
  // 如果已经是Date对象
  else if (timeValue instanceof Date) {
    date = timeValue;
  }
  // 其他情况，尝试转换
  else {
    date = new Date(timeValue);
  }
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return { date: '', time: '' };
  }
  
  // 转换为东八区时间（UTC+8）
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  const beijingTime = new Date(utcTime + (8 * 3600000));
  
  // 格式化为 YYYY-MM-DD 和 HH:MM
  const year = beijingTime.getFullYear();
  const month = String(beijingTime.getMonth() + 1).padStart(2, '0');
  const day = String(beijingTime.getDate()).padStart(2, '0');
  const hours = String(beijingTime.getHours()).padStart(2, '0');
  const minutes = String(beijingTime.getMinutes()).padStart(2, '0');
  
  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`
  };
};

// 根据标题判断演出类型
const getPerformanceType = (title) => {
  if (!title) return '其他';
  
  if (title.includes('定期公演') || title.includes('定期')) return '定期公演';
  if (title.includes('生日') || title.includes('特别')) return '特别公演';
  if (title.includes('见面会') || title.includes('粉丝')) return '见面会';
  if (title.includes('演唱会') || title.includes('音乐会')) return '演唱会';
  
  return '其他';
};

// 根据时间判断演出状态 - 使用东八区时间
const getPerformanceStatus = (startTime, endTime) => {
  if (!startTime) return 'upcoming';
  
  // 获取当前东八区时间
  const now = getBeijingTime();
  const start = parseTimeToBeijing(startTime);
  const end = endTime ? parseTimeToBeijing(endTime) : null;
  
  // 检查时间是否有效
  if (isNaN(start.getTime())) return 'upcoming';
  if (end && isNaN(end.getTime())) return 'upcoming';
  
  if (end && now > end) {
    return 'completed';
  }
  if (now > start) {
    return 'in_progress';
  }
  return 'upcoming';
};

// 获取当前东八区时间
const getBeijingTime = () => {
  const now = new Date();
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utcTime + (8 * 3600000));
};

// 将时间戳转换为东八区时间
const parseTimeToBeijing = (timeValue) => {
  if (!timeValue) return getBeijingTime();
  
  let date;
  
  // 如果是数字（毫秒时间戳），直接创建Date对象
  if (typeof timeValue === 'number') {
    date = new Date(timeValue);
  }
  // 如果是字符串，尝试解析
  else if (typeof timeValue === 'string') {
    date = new Date(timeValue);
  }
  // 如果已经是Date对象
  else if (timeValue instanceof Date) {
    date = timeValue;
  }
  // 其他情况，尝试转换
  else {
    date = new Date(timeValue);
  }
  
  // 转换为东八区时间
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  return new Date(utcTime + (8 * 3600000));
};

// 时间解析辅助函数 - 专门处理毫秒时间戳
const parseTime = (timeValue) => {
  if (!timeValue) return new Date();
  
  // 如果是数字（毫秒时间戳），直接创建Date对象
  if (typeof timeValue === 'number') {
    return new Date(timeValue);
  }
  // 如果是字符串，尝试解析
  else if (typeof timeValue === 'string') {
    return new Date(timeValue);
  }
  // 如果已经是Date对象
  else if (timeValue instanceof Date) {
    return timeValue;
  }
  // 其他情况，尝试转换
  else {
    return new Date(timeValue);
  }
};
