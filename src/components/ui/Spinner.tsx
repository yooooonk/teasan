import './Spinner.css';

const FLOWER_ICONS = [
    '/icons/flower1.png',
    '/icons/flower2.png',
    '/icons/flower3.png',
];

export default function Spinner() {
    return (
        <div className="wrapper">
            <div className="text">로딩중</div>
            <div className="flowers" aria-hidden>
                {FLOWER_ICONS.map((src) => (
                    <img key={src} src={src} alt="" className="flower" />
                ))}
            </div>
        </div>
    );
}
