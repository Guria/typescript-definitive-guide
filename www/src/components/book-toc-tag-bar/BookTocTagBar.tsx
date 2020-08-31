import React, { FC, useEffect, useRef } from "react";
import { BookTocTag } from "../book-toc-tag/BookTocTag";
import { Subject, merge, Observable } from "rxjs";
import { auditTime, debounceTime, delay, takeUntil, tap, throttleTime } from "rxjs/operators";
import { useTranslator } from "../../react__hooks/translator.hook";
import { BookTocGuiLocalization, LocalizationPaths } from "../../localization";
import { useBookTocPageStores } from "../../stores/BookTocPageMobxEntry";


interface IBookTocTagBarProps {
}

type FilterSectionUseRef={
  bookTocTree$:Subject<string>|null,
  filterSection:Observable<string>|null
}

const SECONDARY_CONTENT_BAR_CLOSE_DELAY = 400;


export const BookTocTagBar: FC<IBookTocTagBarProps> = ( {} ) => {
  let [t] = useTranslator<[BookTocGuiLocalization]>( LocalizationPaths.BookChaptersPageGui );
  let { bookTocCollapseStore, bookTocSectionStore, tocFilterStore } = useBookTocPageStores();
  let filterSectionRef = useRef<FilterSectionUseRef>( {
    bookTocTree$: null,
    filterSection: null
  } );


  useEffect( () => {
    filterSectionRef.current.bookTocTree$ = new Subject<string>();
    filterSectionRef.current.filterSection = filterSectionRef.current.bookTocTree$.pipe(
      auditTime(SECONDARY_CONTENT_BAR_CLOSE_DELAY),
      tap( sectionName => {
        window.scrollTo( window.scrollX, 0 );
        tocFilterStore.close();

        if ( sectionName === "" ) {
          bookTocSectionStore.showAll();
        }else{

          bookTocSectionStore.hideBySectionName( sectionName );
        }
      } )
    );


    let filterSectionSubscription = filterSectionRef.current.filterSection.subscribe();

    return () => {
      filterSectionSubscription.unsubscribe();
    };
  }, [] );

  const filterBySectionName = ( sectionName: string ) =>
    filterSectionRef.current.bookTocTree$?.next( sectionName );
  const cleanFilter = () =>
    filterSectionRef.current.bookTocTree$?.next( "" );

  let bookTocSectionSet = bookTocSectionStore.tree
    .reduce( ( result, current ) => result.add( current.data.section ), new Set<string>() );
  let bookTocSortSectionAll = Array.from( bookTocSectionSet )
    .sort( ( a, b ) => a.charCodeAt(0) - b.charCodeAt(0) );



  let bookTocTagAll = bookTocSortSectionAll.map( (sectionName,index) => (
    <BookTocTag key={index}
                section={sectionName}
                sectionMatchCount={bookTocSectionStore.getSectionMatchCount(sectionName)}
                onClick={()=>filterBySectionName(sectionName)}>
      {sectionName}
    </BookTocTag>
  ) );





  return (
    <div className="book-toc__tag-bar">
      <div className="book-toc__tag book-toc__tag_clear-filter" onClick={cleanFilter}>
        {t.asideLayout.tagBar.cleanFilterButton}
      </div>
      {bookTocTagAll}
    </div>
  );
};
