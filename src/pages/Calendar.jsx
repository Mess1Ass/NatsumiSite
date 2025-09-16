import React, { useState, useEffect } from 'react';
import { Card, Timeline, Badge, Button, Space, Typography, Row, Col, Tag, Avatar, Divider, Spin, Empty, Toast, Modal, Form, Input, DatePicker, TimePicker, Select } from '@douyinfe/semi-ui';
import { IconCalendar, IconClock, IconMapPin, IconStar, IconLikeHeart, IconEdit, IconDelete, IconPlus } from '@douyinfe/semi-icons';
import { getAllShowLogs, transformShowLogData, insertShowLog, updateShowLog, deleteShowLog } from '../services/showLogService';
import { getCurrentDomainConfig } from '../config';
import './Calendar.css';

const { Title, Text, Paragraph } = Typography;

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'timeline'
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 编辑者模式状态
  const domainConfig = getCurrentDomainConfig();
  const isEditorMode = domainConfig.editorMode;
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPerformance, setEditingPerformance] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    startDate: null,
    startTime: null,
    endDate: null,
    endTime: null
  });
  
  // 暂休状态
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakPerformance, setBreakPerformance] = useState(null);

  // 获取演出数据
  useEffect(() => {
    fetchPerformances();
  }, []);

  // 检查暂休状态
  useEffect(() => {
    if (performances.length > 0) {
      // 查找暂休演出（查找原始记录）
      const breakPerf = performances.find(perf => 
        perf.title === '暂休' && 
        perf.status === 'in_progress' &&
        perf.isOriginal // 查找原始记录
      );
      if (breakPerf) {
        setIsOnBreak(true);
        setBreakPerformance(breakPerf);
      } else {
        setIsOnBreak(false);
        setBreakPerformance(null);
      }
    }
  }, [performances]);

  const fetchPerformances = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getAllShowLogs();
      
      if (result.success) {
        const transformedData = transformShowLogData(result.data);
        setPerformances(transformedData);
      } else {
        setError(result.error);
        Toast.error('获取演出数据失败: ' + result.error);
      }
    } catch (err) {
      setError(err.message);
      Toast.error('获取演出数据失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 编辑功能处理函数
  const handleAddPerformance = () => {
    setEditingPerformance(null);
    setFormData({
      title: '',
      location: '',
      startDate: null,
      startTime: null,
      endDate: null,
      endTime: null
    });
    setModalVisible(true);
  };

  const handleEditPerformance = (performance) => {
    setEditingPerformance(performance);
    
    // 创建开始时间的Date对象
    const startDate = new Date(performance.startTime);
    const startTime = new Date(performance.startTime);
    
    // 创建结束时间的Date对象
    // 如果没有结束时间，使用开始时间作为默认值
    let endDate = null;
    let endTime = null;
    if (performance.endTimeRaw) {
      endDate = new Date(performance.endTimeRaw);
      endTime = new Date(performance.endTimeRaw);
    } else {
      // 如果没有结束时间，使用开始时间作为默认值
      endDate = new Date(performance.startTime);
      endTime = new Date(performance.startTime);
    }
    
    const newFormData = {
      title: performance.title,
      location: performance.location,
      startDate: startDate,
      startTime: startTime,
      endDate: endDate,
      endTime: endTime
    };
    
    
    setFormData(newFormData);
    setModalVisible(true);
  };

  const handleDeletePerformance = async (performance) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除演出"${performance.title}"吗？`,
      onOk: async () => {
        try {
          const result = await deleteShowLog(performance.id);
          if (result.success) {
            Toast.success('删除成功');
            fetchPerformances();
          } else {
            Toast.error('删除失败: ' + result.error);
          }
        } catch (err) {
          Toast.error('删除失败: ' + err.message);
        }
      }
    });
  };

  const handleSavePerformance = async () => {
    try {
      // 验证表单数据
      if (!formData.title || !formData.location || !formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) {
        Toast.error('请填写完整信息');
        return;
      }

      // 构建开始时间
      const startDateTime = new Date(formData.startDate);
      startDateTime.setHours(formData.startTime.getHours());
      startDateTime.setMinutes(formData.startTime.getMinutes());
      startDateTime.setSeconds(0);
      startDateTime.setMilliseconds(0);

      // 构建结束时间（现在是必填的）
      const endDateTime = new Date(formData.endDate);
      endDateTime.setHours(formData.endTime.getHours());
      endDateTime.setMinutes(formData.endTime.getMinutes());
      endDateTime.setSeconds(0);
      endDateTime.setMilliseconds(0);

      const performanceData = {
        title: formData.title,
        location: formData.location,
        startTime: startDateTime.getTime(),
        endTime: endDateTime.getTime()
      };

      let result;
      if (editingPerformance) {
        // 更新演出
        result = await updateShowLog({
          _id: editingPerformance.id,
          ...performanceData
        });
      } else {
        // 添加演出
        result = await insertShowLog(performanceData);
      }

      if (result.success) {
        Toast.success(editingPerformance ? '更新成功' : '添加成功');
        setModalVisible(false);
        fetchPerformances();
      } else {
        Toast.error((editingPerformance ? '更新失败' : '添加失败') + ': ' + result.error);
      }
    } catch (err) {
      Toast.error((editingPerformance ? '更新失败' : '添加失败') + ': ' + err.message);
    }
  };

  // 开始暂休
  const handleStartBreak = async () => {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // 设置开始时间为今天
      const startTime = today.getTime();
      
      // 设置结束时间为很远的未来（相当于无限）
      const endTime = new Date(2099, 11, 31, 23, 59, 59).getTime();
      
      const breakData = {
        title: '暂休',
        location: '暂休',
        startTime: startTime,
        endTime: endTime
      };

      const result = await insertShowLog(breakData);
      
      if (result.success) {
        Toast.success('暂休开始');
        fetchPerformances();
      } else {
        Toast.error('开始暂休失败: ' + result.error);
      }
    } catch (err) {
      Toast.error('开始暂休失败: ' + err.message);
    }
  };

  // 停止暂休
  const handleStopBreak = async () => {
    if (!breakPerformance) {
      Toast.error('没有找到暂休记录');
      return;
    }

    try {
      // 使用原始ID删除暂休记录
      const deleteId = breakPerformance.originalId || breakPerformance.id;
      const result = await deleteShowLog(deleteId);
      
      if (result.success) {
        Toast.success('暂休结束');
        fetchPerformances();
      } else {
        Toast.error('停止暂休失败: ' + result.error);
      }
    } catch (err) {
      Toast.error('停止暂休失败: ' + err.message);
    }
  };

  // 获取月份的天数
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // 获取月份第一天是星期几
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // 生成日历数据
  const generateCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // 添加上个月的空白日期
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // 添加当前月的日期
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayPerformances = performances.filter(p => p.date === dateStr);
      days.push({
        day,
        date: dateStr,
        performances: dayPerformances
      });
    }

    return days;
  };

  // 获取演出状态颜色
  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'blue';
      case 'in_progress': return 'orange';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'grey';
    }
  };

  // 获取演出类型颜色
  const getTypeColor = (type) => {
    switch (type) {
      case '定期公演': return 'pink';
      case '特别公演': return 'purple';
      case '见面会': return 'orange';
      default: return 'blue';
    }
  };

  const calendarDays = generateCalendar();
  const selectedPerformances = performances.filter(p => p.date === selectedDate.toISOString().split('T')[0]);

  // 加载状态
  if (loading) {
    return (
      <div className="calendar-container">
        <div className="calendar-header">
          <Title level={2} className="calendar-title">
            <IconCalendar style={{ marginRight: 8 }} />
            夏沫演出安排
          </Title>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="calendar-container">
        <div className="calendar-header">
          <Title level={2} className="calendar-title">
            <IconCalendar style={{ marginRight: 8 }} />
            夏沫演出安排
          </Title>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Empty 
            title="加载失败" 
            description={error}
            image={<IconCalendar style={{ fontSize: 64, color: '#f06292' }} />}
          >
            <Button onClick={fetchPerformances}>重新加载</Button>
          </Empty>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <Title level={2} className="calendar-title">
          <IconCalendar style={{ marginRight: 8 }} />
          夏沫演出安排
        </Title>
        <Space>
          <Button 
            type="tertiary"
            onClick={() => setCurrentMonth(new Date())}
          >
            回到本月
          </Button>
          <Button 
            type={viewMode === 'calendar' ? 'primary' : 'tertiary'}
            onClick={() => setViewMode('calendar')}
          >
            日历视图
          </Button>
          <Button 
            type={viewMode === 'timeline' ? 'primary' : 'tertiary'}
            onClick={() => setViewMode('timeline')}
          >
            时间轴
          </Button>
          <Button onClick={fetchPerformances}>
            刷新数据
          </Button>
          {isEditorMode && (
            <Space>
              <Button 
                type="primary" 
                icon={<IconPlus />}
                onClick={handleAddPerformance}
              >
                添加演出
              </Button>
              {!isOnBreak ? (
                <Button 
                  type="secondary" 
                  onClick={handleStartBreak}
                >
                  暂休
                </Button>
              ) : (
                <Button 
                  type="danger" 
                  onClick={handleStopBreak}
                >
                  停止暂休
                </Button>
              )}
            </Space>
          )}
        </Space>
      </div>

      {viewMode === 'calendar' && (
        <div className="calendar-content">
          <Card className="calendar-card">
            <div className="calendar-nav">
              <Button 
                icon={<IconClock />}
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              >
                上个月
              </Button>
              <Title level={3} className="month-title">
                {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
              </Title>
              <Button 
                icon={<IconClock />}
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              >
                下个月
              </Button>
            </div>

            <div className="calendar-grid">
              <div className="calendar-weekdays">
                {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                  <div key={day} className="weekday">{day}</div>
                ))}
              </div>
              <div className="calendar-days">
                {calendarDays.map((day, index) => (
                  <div 
                    key={index} 
                    className={`calendar-day ${day && day.performances.length > 0 ? 'has-performance' : ''} ${day && day.date === selectedDate.toISOString().split('T')[0] ? 'selected' : ''}`}
                    onClick={() => day && setSelectedDate(new Date(day.date))}
                  >
                    {day && (
                      <>
                        <div className="day-number">{day.day}</div>
                        {day.performances.length > 0 && (
                          <div className="performance-titles">
                            {day.performances.slice(0, 3).map(perf => (
                              <div 
                                key={perf.id} 
                                className="performance-title"
                                style={{ 
                                  color: getStatusColor(perf.status),
                                  backgroundColor: `${getStatusColor(perf.status)}20`
                                }}
                                title={`${perf.title} - ${perf.time}${perf.endTime ? ` - ${perf.endTime}` : ''}`}
                              >
                                {perf.title.length > 8 ? `${perf.title.substring(0, 8)}...` : perf.title}
                              </div>
                            ))}
                            {day.performances.length > 3 && (
                              <div className="more-performances">
                                +{day.performances.length - 3}个
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {selectedPerformances.length > 0 && (
            <Card className="selected-performances">
              <Title level={4}>选中日期的演出</Title>
              <Row gutter={[16, 16]}>
                {selectedPerformances.map(perf => (
                  <Col span={24} key={perf.id}>
                    <Card className="performance-card">
                      <div className="performance-header">
                        <div className="performance-info">
                          <Title level={5}>{perf.title}</Title>
                          <Space>
                            <Tag color={getTypeColor(perf.type)}>{perf.type}</Tag>
                            <Tag color={getStatusColor(perf.status)}>
                              {perf.status === 'upcoming' ? '即将开始' : 
                               perf.status === 'in_progress' ? '进行中' :
                               perf.status === 'completed' ? '已完成' : '已取消'}
                            </Tag>
                          </Space>
                        </div>
                        <div className="performance-actions">
                          <div className="performance-time">
                            <Text type="secondary">
                              <IconClock style={{ marginRight: 4 }} />
                              {perf.time}
                              {perf.endTime && ` - ${perf.endTime}`}
                            </Text>
                          </div>
                          {isEditorMode && (
                            <Space>
                              <Button 
                                size="small" 
                                icon={<IconEdit />}
                                onClick={() => handleEditPerformance(perf)}
                              >
                                编辑
                              </Button>
                              <Button 
                                size="small" 
                                type="danger"
                                icon={<IconDelete />}
                                onClick={() => handleDeletePerformance(perf)}
                              >
                                删除
                              </Button>
                            </Space>
                          )}
                        </div>
                      </div>
                      <div className="performance-details">
                        <Text type="secondary">
                          <IconMapPin style={{ marginRight: 4 }} />
                          {perf.location}
                        </Text>
                        <Paragraph className="performance-description">
                          {perf.description}
                        </Paragraph>
                        <div className="performance-members">
                          {perf.members.map((member, index) => (
                            <Tag key={index} color="pink" size="small">
                              <IconStar style={{ marginRight: 2 }} />
                              {member}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          )}
        </div>
      )}

      {viewMode === 'timeline' && (
        <div className="timeline-content">
          <Card className="timeline-card">
            <Title level={4}>演出时间轴</Title>
            {performances.length === 0 ? (
              <Empty 
                title="暂无演出安排" 
                description="还没有演出安排，请稍后再查看"
                image={<IconCalendar style={{ fontSize: 64, color: '#f06292' }} />}
              />
            ) : (
              <Timeline>
                {performances
                  .filter(perf => !perf.isBreak || perf.isOriginal) // 显示原始记录和暂休的原始记录
                  .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                  .map(perf => (
                    <Timeline.Item 
                      key={perf.id}
                      color={getStatusColor(perf.status)}
                      dot={<IconLikeHeart style={{ color: '#f06292' }} />}
                    >
                      <Card className="timeline-performance-card">
                        <div className="timeline-performance-header">
                          <Title level={5}>{perf.title}</Title>
                          <Space>
                            <Text type="secondary">{perf.date}</Text>
                            <Text type="secondary">
                              {perf.time}
                              {perf.endTime && ` - ${perf.endTime}`}
                            </Text>
                            {isEditorMode && (
                              <Space>
                                <Button 
                                  size="small" 
                                  icon={<IconEdit />}
                                  onClick={() => handleEditPerformance(perf)}
                                >
                                  编辑
                                </Button>
                                <Button 
                                  size="small" 
                                  type="danger"
                                  icon={<IconDelete />}
                                  onClick={() => handleDeletePerformance(perf)}
                                >
                                  删除
                                </Button>
                              </Space>
                            )}
                          </Space>
                        </div>
                        <div className="timeline-performance-content">
                          <Text type="secondary">
                            <IconMapPin style={{ marginRight: 4 }} />
                            {perf.location}
                          </Text>
                          <Paragraph className="timeline-description">
                            {perf.description}
                          </Paragraph>
                          <div className="timeline-tags">
                            <Tag color={getTypeColor(perf.type)}>{perf.type}</Tag>
                            <Tag color={getStatusColor(perf.status)}>
                              {perf.status === 'upcoming' ? '即将开始' : 
                               perf.status === 'in_progress' ? '进行中' :
                               perf.status === 'completed' ? '已完成' : '已取消'}
                            </Tag>
                          </div>
                        </div>
                      </Card>
                    </Timeline.Item>
                  ))}
              </Timeline>
            )}
          </Card>
        </div>
      )}

      {/* 编辑模态框 */}
      {isEditorMode && (
        <Modal
          title={editingPerformance ? '编辑演出' : '添加演出'}
          visible={modalVisible}
          onOk={handleSavePerformance}
          onCancel={() => setModalVisible(false)}
          width={600}
        >
          <Form 
            initValues={formData}
            onValueChange={(values) => setFormData({...formData, ...values})}
          >
            <Form.Input
              label="演出标题"
              field="title"
              placeholder="请输入演出标题"
              rules={[{ required: true, message: '请输入演出标题' }]}
            />
            
            <Form.Input
              label="演出地点"
              field="location"
              placeholder="请输入演出地点"
              rules={[{ required: true, message: '请输入演出地点' }]}
            />
            
            <Form.DatePicker
              label="开始日期"
              field="startDate"
              placeholder="请选择开始日期"
              rules={[{ required: true, message: '请选择开始日期' }]}
            />
            
            <Form.TimePicker
              label="开始时间"
              field="startTime"
              placeholder="请选择开始时间"
              rules={[{ required: true, message: '请选择开始时间' }]}
            />
            
            <Form.DatePicker
              label="结束日期"
              field="endDate"
              placeholder="请选择结束日期"
              rules={[{ required: true, message: '请选择结束日期' }]}
            />
            
            <Form.TimePicker
              label="结束时间"
              field="endTime"
              placeholder="请选择结束时间"
              rules={[{ required: true, message: '请选择结束时间' }]}
            />
          </Form>
        </Modal>
      )}
    </div>
  );
};

export default Calendar;