// src/pages/moments/MomentCalendarPage.tsx
import React, { useState, useMemo } from 'react';
import { 
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  ListBulletIcon,
  Squares2X2Icon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  BellIcon,
  ComputerDesktopIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  PlayIcon,
  PauseIcon,
  InformationCircleIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

// Types
interface CalendarMoment {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'web' | 'in-app';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledDate: string;
  scheduledTime: string;
  duration?: number; // in minutes
  audienceSize: number;
  description: string;
  tags: string[];
  campaign?: string;
}

interface CalendarEvent extends CalendarMoment {
  startTime: Date;
  endTime: Date;
}

const MomentCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<'month' | 'week' | 'list'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'active' | 'completed'>('all');
  const [filterType, setFilterType] = useState<'all' | 'email' | 'sms' | 'push' | 'web' | 'in-app'>('all');

  // Mock moments data - replace with actual API call
  const moments = useMemo<CalendarMoment[]>(() => [
    {
      id: '1',
      name: 'Welcome Email - New Users',
      type: 'email',
      status: 'scheduled',
      priority: 'high',
      scheduledDate: '2024-01-15',
      scheduledTime: '09:00',
      duration: 15,
      audienceSize: 1250,
      description: 'Onboarding email for new user registrations',
      tags: ['onboarding', 'welcome'],
      campaign: 'Q1 User Acquisition'
    },
    {
      id: '2',
      name: 'Flash Sale SMS',
      type: 'sms',
      status: 'scheduled',
      priority: 'urgent',
      scheduledDate: '2024-01-16',
      scheduledTime: '14:00',
      duration: 30,
      audienceSize: 8500,
      description: '24-hour flash sale announcement',
      tags: ['promotion', 'sale'],
      campaign: 'January Flash Sales'
    },
    {
      id: '3',
      name: 'Product Launch Push',
      type: 'push',
      status: 'active',
      priority: 'high',
      scheduledDate: '2024-01-14',
      scheduledTime: '10:00',
      duration: 60,
      audienceSize: 15600,
      description: 'New product launch announcement',
      tags: ['product-launch', 'announcement'],
      campaign: 'Product Launch 2024'
    },
    {
      id: '4',
      name: 'Weekly Newsletter',
      type: 'email',
      status: 'scheduled',
      priority: 'medium',
      scheduledDate: '2024-01-18',
      scheduledTime: '08:00',
      duration: 20,
      audienceSize: 12400,
      description: 'Weekly company and product updates',
      tags: ['newsletter', 'weekly'],
      campaign: 'Content Marketing'
    },
    {
      id: '5',
      name: 'Cart Abandonment Reminder',
      type: 'email',
      status: 'active',
      priority: 'medium',
      scheduledDate: '2024-01-17',
      scheduledTime: '16:00',
      duration: 10,
      audienceSize: 2300,
      description: 'Automated cart abandonment follow-up',
      tags: ['automation', 'cart-abandonment'],
      campaign: 'Retention Campaign'
    },
    {
      id: '6',
      name: 'Survey Request',
      type: 'in-app',
      status: 'scheduled',
      priority: 'low',
      scheduledDate: '2024-01-19',
      scheduledTime: '11:00',
      duration: 45,
      audienceSize: 5600,
      description: 'Customer satisfaction survey',
      tags: ['survey', 'feedback'],
      campaign: 'Customer Experience'
    },
    {
      id: '7',
      name: 'Event Reminder',
      type: 'push',
      status: 'scheduled',
      priority: 'medium',
      scheduledDate: '2024-01-20',
      scheduledTime: '13:00',
      duration: 25,
      audienceSize: 3400,
      description: 'Webinar reminder notification',
      tags: ['event', 'reminder'],
      campaign: 'Educational Webinars'
    },
    {
      id: '8',
      name: 'Monthly Report',
      type: 'email',
      status: 'completed',
      priority: 'low',
      scheduledDate: '2024-01-01',
      scheduledTime: '09:00',
      duration: 30,
      audienceSize: 890,
      description: 'Monthly performance and insights report',
      tags: ['report', 'monthly'],
      campaign: 'Business Intelligence'
    }
  ], []);

  // Filter moments based on search and filters
  const filteredMoments = useMemo(() => {
    return moments.filter(moment => {
      const matchesSearch = searchTerm === '' || 
        moment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        moment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        moment.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = filterStatus === 'all' || moment.status === filterStatus;
      const matchesType = filterType === 'all' || moment.type === filterType;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [moments, searchTerm, filterStatus, filterType]);

  // Convert moments to calendar events
  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    return filteredMoments.map(moment => {
      const startTime = parseISO(`${moment.scheduledDate}T${moment.scheduledTime}`);
      const endTime = new Date(startTime.getTime() + (moment.duration || 30) * 60000);
      
      return {
        ...moment,
        startTime,
        endTime
      };
    });
  }, [filteredMoments]);

  // Generate calendar grid for month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = [];
    let day = calendarStart;

    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  }, [currentDate]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter(event => 
      isSameDay(event.startTime, date)
    );
  };

  // Get events for the current week
  const getWeekEvents = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    
    return calendarEvents.filter(event => 
      event.startTime >= weekStart && event.startTime <= weekEnd
    );
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleMomentClick = (momentId: string) => {
    navigate(`/moments/${momentId}`);
  };

  const handleCreateMoment = (date?: Date) => {
    const queryParams = date ? `?date=${format(date, 'yyyy-MM-dd')}` : '';
    navigate(`/moments/builder${queryParams}`);
  };

  const getStatusColor = (status: CalendarMoment['status']) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-purple-100 text-purple-800'
    };
    return colors[status];
  };

  const getPriorityColor = (priority: CalendarMoment['priority']) => {
    const colors = {
      low: 'border-l-gray-400',
      medium: 'border-l-blue-400',
      high: 'border-l-orange-400',
      urgent: 'border-l-red-400'
    };
    return colors[priority];
  };

  const getChannelIcon = (type: CalendarMoment['type']) => {
    const icons = {
      email: EnvelopeIcon,
      sms: DevicePhoneMobileIcon,
      push: BellIcon,
      web: ComputerDesktopIcon,
      'in-app': ChatBubbleLeftRightIcon
    };
    return icons[type] || InformationCircleIcon;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Moment Calendar</h1>
              <p className="text-gray-600 mt-1">Schedule and manage your marketing moments</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button onClick={() => handleCreateMoment()}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Moment
              </Button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-6 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              {/* Navigation */}
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                  <ChevronLeftIcon className="w-4 h-4" />
                </Button>
                <h2 className="text-xl font-semibold min-w-[180px] text-center">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <Button variant="outline" size="sm" onClick={handleNextMonth}>
                  <ChevronRightIcon className="w-4 h-4" />
                </Button>
              </div>

              {/* View Toggle */}
              <div className="flex rounded-lg border border-gray-200 bg-white">
                {[
                  { value: 'month', label: 'Month', icon: Squares2X2Icon },
                  { value: 'week', label: 'Week', icon: ListBulletIcon },
                  { value: 'list', label: 'List', icon: ListBulletIcon }
                ].map((view) => {
                  const Icon = view.icon;
                  return (
                    <button
                      key={view.value}
                      onClick={() => setViewType(view.value as any)}
                      className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                        viewType === view.value
                          ? 'bg-blue-50 text-blue-600 border-blue-200'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-1" />
                      {view.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search moments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="all">All Types</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="push">Push</option>
                <option value="web">Web</option>
                <option value="in-app">In-App</option>
              </select>
            </div>
          </div>
        </div>

        {/* Calendar Views */}
        {viewType === 'month' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 border-b border-gray-200">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-4 text-center text-sm font-medium text-gray-700 bg-gray-50">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                const dayEvents = getEventsForDate(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isDayToday = isToday(day);

                return (
                  <div
                    key={index}
                    onClick={() => handleDateClick(day)}
                    className={`min-h-[120px] border-b border-r border-gray-200 p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                      !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                    } ${isSelected ? 'bg-blue-50' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isDayToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : ''
                    }`}>
                      {format(day, 'd')}
                    </div>
                    
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => {
                        const Icon = getChannelIcon(event.type);
                        return (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMomentClick(event.id);
                            }}
                            className={`text-xs p-1 rounded border-l-2 bg-white hover:bg-gray-50 cursor-pointer ${getPriorityColor(event.priority)}`}
                          >
                            <div className="flex items-center space-x-1 mb-1">
                              <Icon className="w-3 h-3" />
                              <Badge className={`${getStatusColor(event.status)} text-xs py-0 px-1`}>
                                {event.status}
                              </Badge>
                            </div>
                            <div className="font-medium truncate">{event.name}</div>
                            <div className="text-gray-500">{format(event.startTime, 'HH:mm')}</div>
                          </div>
                        );
                      })}
                      
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 font-medium">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewType === 'week' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Week Header */}
            <div className="grid grid-cols-8 border-b border-gray-200">
              <div className="p-4 border-r border-gray-200"></div>
              {Array.from({ length: 7 }, (_, i) => {
                const day = addDays(startOfWeek(currentDate), i);
                return (
                  <div key={i} className="p-4 text-center border-r border-gray-200 last:border-r-0">
                    <div className="text-sm text-gray-600">{format(day, 'EEE')}</div>
                    <div className={`text-lg font-semibold ${isToday(day) ? 'text-blue-600' : 'text-gray-900'}`}>
                      {format(day, 'd')}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Week Grid */}
            <div className="grid grid-cols-8">
              {/* Time Column */}
              <div className="border-r border-gray-200">
                {Array.from({ length: 24 }, (_, hour) => (
                  <div key={hour} className="h-16 border-b border-gray-100 p-2 text-xs text-gray-500">
                    {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
                  </div>
                ))}
              </div>

              {/* Day Columns */}
              {Array.from({ length: 7 }, (_, dayIndex) => {
                const day = addDays(startOfWeek(currentDate), dayIndex);
                const dayEvents = getEventsForDate(day);

                return (
                  <div key={dayIndex} className="border-r border-gray-200 last:border-r-0 relative">
                    {Array.from({ length: 24 }, (_, hour) => (
                      <div key={hour} className="h-16 border-b border-gray-100"></div>
                    ))}
                    
                    {/* Events */}
                    {dayEvents.map((event) => {
                      const Icon = getChannelIcon(event.type);
                      const startHour = event.startTime.getHours();
                      const startMinute = event.startTime.getMinutes();
                      const top = (startHour * 64) + (startMinute * 64 / 60);
                      const height = Math.max((event.duration || 30) * 64 / 60, 32);

                      return (
                        <div
                          key={event.id}
                          onClick={() => handleMomentClick(event.id)}
                          className={`absolute left-1 right-1 p-1 rounded text-xs bg-white border-l-2 cursor-pointer hover:shadow-md ${getPriorityColor(event.priority)}`}
                          style={{ top: `${top}px`, height: `${height}px` }}
                        >
                          <div className="flex items-center space-x-1 mb-1">
                            <Icon className="w-3 h-3" />
                            <Badge className={`${getStatusColor(event.status)} text-xs py-0 px-1`}>
                              {event.status}
                            </Badge>
                          </div>
                          <div className="font-medium truncate">{event.name}</div>
                          <div className="text-gray-500">
                            {format(event.startTime, 'HH:mm')} - {format(event.endTime, 'HH:mm')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewType === 'list' && (
          <div className="space-y-4">
            {filteredMoments.length === 0 ? (
              <Card>
                <CardBody className="text-center py-12">
                  <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No moments found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your search criteria or create a new moment.</p>
                  <Button onClick={() => handleCreateMoment()}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Create Moment
                  </Button>
                </CardBody>
              </Card>
            ) : (
              filteredMoments.map((moment) => {
                const Icon = getChannelIcon(moment.type);
                return (
                  <Card key={moment.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardBody onClick={() => handleMomentClick(moment.id)}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex-shrink-0">
                            <Icon className="w-6 h-6 text-gray-600 mt-1" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {moment.name}
                              </h3>
                              <Badge className={getStatusColor(moment.status)}>
                                {moment.status.toUpperCase()}
                              </Badge>
                              <Badge variant="outline">
                                {moment.type.toUpperCase()}
                              </Badge>
                            </div>
                            
                            <p className="text-gray-600 mb-3">{moment.description}</p>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <CalendarIcon className="w-4 h-4" />
                                <span>{format(parseISO(moment.scheduledDate), 'MMM d, yyyy')}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <ClockIcon className="w-4 h-4" />
                                <span>{moment.scheduledTime}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {moment.audienceSize.toLocaleString()} recipients
                                </span>
                              </div>
                            </div>
                            
                            {moment.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {moment.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <div className={`w-3 h-8 rounded ${getPriorityColor(moment.priority).replace('border-l-', 'bg-')}`}></div>
                          <Button variant="outline" size="sm">
                            <EyeIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Selected Date Details Modal/Sidebar could go here */}
        {selectedDate && viewType === 'month' && (
          <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl border-l border-gray-200 p-6 overflow-y-auto z-50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                {format(selectedDate, 'MMMM d, yyyy')}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <Button onClick={() => handleCreateMoment(selectedDate)} className="w-full">
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Moment for This Date
              </Button>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Scheduled Moments ({getEventsForDate(selectedDate).length})
                </h4>
                
                {getEventsForDate(selectedDate).length === 0 ? (
                  <p className="text-gray-500 text-sm">No moments scheduled for this date.</p>
                ) : (
                  <div className="space-y-2">
                    {getEventsForDate(selectedDate).map((event) => {
                      const Icon = getChannelIcon(event.type);
                      return (
                        <div
                          key={event.id}
                          onClick={() => handleMomentClick(event.id)}
                          className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <Icon className="w-4 h-4" />
                            <span className="font-medium text-sm">{event.name}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(event.startTime, 'HH:mm')} - {format(event.endTime, 'HH:mm')}
                          </div>
                          <Badge className={`${getStatusColor(event.status)} text-xs mt-1`}>
                            {event.status}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MomentCalendarPage;