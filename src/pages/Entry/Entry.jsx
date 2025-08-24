import { Link } from "react-router-dom";
import "@/styles/Entry.css";

export default function EntryPage() {
  return (
    <main className="entry">
      {/* 상단 헤더 */}
      <div className="entry__hero">건너건너</div>

      {/* 중앙 컨텐츠 */}
      <section className="entry__main">
        <h1 className="entry__slogan">
          "동네를 한 뼘 더 가깝게"
          <span>이웃 · 가게 · 정보가 연결되는 로컬 네트워크</span>
        </h1>

        <div className="entry__actions">
          <Link className="entry__btn entry__btn--primary" to="/login">
            Login
          </Link>
          <Link className="entry__btn entry__btn--ghost" to="/signup">
            Sign Up
          </Link>
        </div>
      </section>
    </main>
  );
}

