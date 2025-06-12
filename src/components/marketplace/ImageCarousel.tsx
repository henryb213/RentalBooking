"use client";

import Image from "next/image";
import React, { CSSProperties } from "react";
import { useSnapCarousel } from "react-snap-carousel";

// https://github.com/richardscarrott/react-snap-carousel

const styles = {
  root: {},
  scroll: {
    position: "relative",
    display: "flex",
    overflow: "hidden",
    scrollSnapType: "x mandatory",
    width: "100%",
  },
  item: {
    width: "100%",
    flexShrink: 0,
    scrollSnapAlign: "start",
  },
  itemSnapPoint: {
    scrollSnapAlign: "start",
  },
  controls: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  nextPrevButton: {},
  nextPrevButtonDisabled: { opacity: 0.5 },
  pagination: {
    display: "flex",
  },
  paginationButton: {
    margin: "10px",
  },
  paginationButtonActive: { opacity: 0.5 },
  pageIndicator: {
    display: "flex",
    justifyContent: "center",
  },
} satisfies Record<string, CSSProperties>;

interface CarouselItemData {
  id: string | number;
  [key: string]: unknown; // Allow additional properties
}

interface CarouselProps<T extends CarouselItemData> {
  readonly items: T[];
  readonly renderItem: (
    props: CarouselRenderItemProps<T>,
  ) => React.ReactElement<CarouselItemProps>;
}

interface CarouselRenderItemProps<T extends CarouselItemData> {
  readonly item: T;
  readonly isSnapPoint: boolean;
}

export const Carousel = <T extends CarouselItemData>({
  items,
  renderItem,
}: CarouselProps<T>) => {
  const {
    scrollRef,
    pages,
    goTo,
    prev,
    next,
    activePageIndex,
    hasPrevPage,
    hasNextPage,
    snapPointIndexes,
  } = useSnapCarousel();
  return (
    <div style={styles.root}>
      <ul style={styles.scroll} ref={scrollRef}>
        {items.map((item, i) =>
          renderItem({
            item,
            isSnapPoint: snapPointIndexes.has(i),
          }),
        )}
      </ul>
      <div style={styles.controls}>
        <button
          style={{
            ...styles.nextPrevButton,
            ...(!hasPrevPage ? styles.nextPrevButtonDisabled : {}),
          }}
          disabled={!hasPrevPage}
          onClick={() => prev()}
        >
          {String.fromCharCode(8592)}
        </button>
        {pages.map((_, i) => (
          <button
            key={i}
            style={{
              ...styles.paginationButton,
              ...(activePageIndex === i ? styles.paginationButtonActive : {}),
            }}
            onClick={() => goTo(i)}
          >
            {i + 1}
          </button>
        ))}
        <button
          style={{
            ...styles.nextPrevButton,
            ...(!hasNextPage ? styles.nextPrevButtonDisabled : {}),
          }}
          disabled={!hasNextPage}
          onClick={() => next()}
        >
          {String.fromCharCode(8594)}
        </button>
      </div>
      <div style={styles.pageIndicator}>
        {activePageIndex + 1} / {pages.length}
      </div>
    </div>
  );
};

interface CarouselItemProps {
  readonly isSnapPoint: boolean;
  readonly children?: React.ReactNode;
  readonly key: string | number;
}

export const CarouselItem = ({ isSnapPoint, children }: CarouselItemProps) => (
  <li
    style={{
      ...styles.item,
      ...(isSnapPoint ? styles.itemSnapPoint : {}),
    }}
    className="max-h-[700px] min-h-[300px]"
  >
    {children}
  </li>
);

const ImageCarousel = ({ listingImages }: { listingImages: string[] }) => {
  const listingItems = React.useMemo(() => {
    if (listingImages) {
      return listingImages.map((src, i) => ({
        id: i,
        src: src,
      }));
    } else return [];
  }, [listingImages]);

  return (
    <Carousel
      items={listingItems}
      renderItem={({ item, isSnapPoint }) => (
        <CarouselItem key={item.id} isSnapPoint={isSnapPoint}>
          <Image
            src={item.src as string}
            width={400}
            height={400}
            className="h-full w-full object-cover"
            alt="Carousel image"
          />
        </CarouselItem>
      )}
    />
  );
};
export default ImageCarousel;
