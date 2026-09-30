import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {act, render, screen} from '@testing-library/react';
import Toaster from './Toaster';
import {clearToasts, toast} from './toast';

beforeEach(() => {
  vi.useFakeTimers();
  clearToasts();
  render(<Toaster />);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Toaster', () => {
  describe('General cases', () => {
    it('기본 1.8초가 지나면 사라진다', () => {
      const title = '오늘과 지난 날짜만 기록할 수 있어요';
      act(() => toast({title}));
      act(() => {
        vi.advanceTimersByTime(DEFAULT_DURATION - 1);
      });
      expect(screen.getByText(title)).toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(screen.queryByText(title)).not.toBeInTheDocument();
    });

    it('duration을 주면 기본 1.8초가 아니라 그 시간 뒤에 사라진다', () => {
      const title = '3초 토스트';
      act(() => toast({title, duration: CUSTOM_DURATION}));
      act(() => {
        vi.advanceTimersByTime(DEFAULT_DURATION);
      });
      expect(screen.getByText(title)).toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(CUSTOM_DURATION - DEFAULT_DURATION);
      });
      expect(screen.queryByText(title)).not.toBeInTheDocument();
    });
  });

  describe('Boundary cases', () => {
    it('3개를 연달아 부르면 가장 오래된 것이 닫히고 2개만 남는다', () => {
      const oldest = '첫째';
      const remaining = ['둘째', '셋째'];
      [oldest, ...remaining].forEach((title) => act(() => toast({title})));
      expect(screen.queryByText(oldest)).not.toBeInTheDocument();
      remaining.forEach((title) => expect(screen.getByText(title)).toBeInTheDocument());
    });

    it('나중에 뜬 토스트가 먼저 닫힌 뒤 새로 부르면, 닫힌 것은 개수에 세지 않아 먼저 뜬 것과 새것 2개가 뜬다', () => {
      act(() => toast({title: '오래 뜨는 것', duration: CUSTOM_DURATION}));
      act(() => toast({title: '금방 닫히는 것'}));
      act(() => {
        vi.advanceTimersByTime(DEFAULT_DURATION);
      });
      expect(screen.queryByText('금방 닫히는 것')).not.toBeInTheDocument();

      act(() => toast({title: '새것'}));
      ['오래 뜨는 것', '새것'].forEach((title) => expect(screen.getByText(title)).toBeInTheDocument());
    });
  });
});

const DEFAULT_DURATION = 1800;
const CUSTOM_DURATION = 3000;
