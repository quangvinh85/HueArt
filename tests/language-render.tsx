import Price from '../src/shop/Price';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {strict as assert} from 'node:assert';
import {LanguageProvider} from '../src/context/LanguageContext';
import {ARTWORKS} from '../src/data/artworks';
import Shop from '../src/shop/Shop';
import {SALE_OPTIONS} from '../src/shop/catalog';
import {translateText} from '../src/shop/language';
import translations from '../src/shop/translations.json';
let language: string|null = null;
Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>key==='hueart_language'?language:null,setItem:()=>{},removeItem:()=>{}}});
const render=(saved:string|null)=>{language=saved;return renderToStaticMarkup(<LanguageProvider><Shop/></LanguageProvider>);};
assert.match(render(null),/Gửi tác phẩm/);
assert.match(render(null),/Giám tuyển AI/);
assert.match(render('invalid'),/Ba cách sở hữu một bức ảnh/);
assert.match(render('en'),/Submit artwork/);
assert.match(render('en'),/AI curator/);
assert.match(render('en'),/High-resolution file/);
assert.match(ARTWORKS[0].titles.en,/Echoes of the Imperial Meridian Gate/);
assert.doesNotMatch(render('en'),/images\/hue\//);
assert.match(render('fr'),/Soumettre une œuvre/);
assert.match(render('fr'),/Conseil IA/);
assert.match(render('fr'),/Fichier haute résolution/);
assert.match(ARTWORKS[0].titles.fr,/Échos de la Porte du Midi Impériale/);
for(const option of SALE_OPTIONS){
  for(const field of ['title','short','description','delivery'] as const){
    assert.ok((translations as Record<string,string[]>)[option[field]],`Missing translation for ${option.id}.${field}`);
    assert.notEqual(translateText(option[field],'en'),option[field]);
    assert.notEqual(translateText(option[field],'fr'),option[field]);
  }
}
assert.equal(translateText('Giỏ hàng ({0})','en',3),'Cart (3)');
assert.equal(translateText('Giỏ hàng ({0})','fr',3),'Panier (3)');
console.log('Language rendering passed: Vietnamese default and invalid-language fallback, English/French UI and artwork titles, sale descriptions and interpolation.');

language='vi';assert.match(renderToStaticMarkup(<LanguageProvider><Price cents={500}/></LanguageProvider>),/5 USD.*<small>~ 130.000 VND<\/small>/);
assert.match(renderToStaticMarkup(<LanguageProvider><Price cents={500} rate={30000}/></LanguageProvider>),/150.000 VND/);

assert.doesNotMatch(render(null).match(/<section class="shop-hero">.*?<\/section>/)?.[0]||'',/VND/);
