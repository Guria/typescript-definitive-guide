export const LocalizationPaths={
    IndexPage:'pages.index',
    BookChaptersPage:'pages.book__chapters',
    BookChapterPage:'pages.book__chapter',
}

interface Page<TMetadata,TGUI> {
    pageMetadata:TMetadata;
    gui:TGUI;
}
export interface BookChapterPageGuiTranslation {
    greeting:string;
}
export interface BookChapterPageMetadataTranslation {

}
export interface BookChapterPage extends Page<BookChapterPageMetadataTranslation,BookChapterPageGuiTranslation>{

}

type Pages={
    'book__chapters':BookChapterPage
}

export interface AppLocalization {
    pages:Pages;
}
export const DefaultLocalization:AppLocalization={
    pages:{
        ['book__chapters']:{
            pageMetadata:{},
            gui:{greeting:'DefaultText'},
        }
    }
}