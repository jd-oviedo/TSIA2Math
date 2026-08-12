#!/usr/bin/env python3
"""
Phase 3 tagger: writes `misconception_tag` onto every CAT item.

Method. Every rule below is an ordered (pattern -> slug) pair authored by
reading the distractor prose. Rules are tried topic-scoped first, then
strand-scoped, then global; first match wins. There is NO default rule: a
distractor that matches nothing is a hard failure, so coverage cannot silently
degrade into a catch-all.

Every emitted slug is checked against data/docs/misconception_taxonomy.json.

Usage:
  python3 scripts/tag_misconceptions.py --report            # coverage, no writes
  python3 scripts/tag_misconceptions.py --show TOPIC        # every assignment
  python3 scripts/tag_misconceptions.py --write TOPIC       # write one topic
  python3 scripts/tag_misconceptions.py --audit TOPIC       # self-audit one topic
Never touches question_bank.json, Supabase, or the upload pipeline.
"""
import json, re, glob, sys, collections, os

TAX = json.load(open("data/docs/misconception_taxonomy.json"))
APPROVED = {s["slug"] for s in TAX["slugs"]}

# Prose rewrites approved in Phase 2 review. (item_id, option) -> new text.
REWRITES = {
 ("PR_P_005","C"): "Student misreads the Green frequency as 4 instead of 3 and sums 5 + 8 + 4 + 4 = 21, concluding the stated total is wrong.",
 ("PR_P_005","D"): "Student omits the Yellow frequency and sums only three rows: 5 + 8 + 3 = 16.",
 ("PR_A_006","C"): "Student misreads the Category D frequency as 5 instead of 6 and sums 7 + 5 + 4 + 5 = 21, concluding the table overcounts by one rather than by two.",
 ("AR_P_030","C"): "Student converts both equations correctly but drops the negative sign on m₁, computing ($\\frac{2}{3}$)($\\frac{3}{2}$) = 1 rather than −1, and concludes the lines are neither parallel nor perpendicular.",
}
# Approved item-content fix (PR_P_005.D option (a)): choice D's arithmetic was
# wrong -- it claimed 18 while its own stated reason (omitting Yellow) gives 16.
CHOICE_FIXES = {
 ("PR_P_005","D"): "No — the frequencies sum to 16; the student omitted the Yellow row when adding.",
}

def load():
    items=[]
    for f in sorted(glob.glob("data/items/*/*.json")):
        for i in json.load(open(f)): i["_file"]=f; items.append(i)
    return items

def rows(items, topic=None):
    out=[]
    for i in items:
        if topic and i["topic_id"]!=topic: continue
        for opt in sorted(i["answer_choices"]):
            if opt==i["correct_answer"]: continue
            txt=REWRITES.get((i["item_id"],opt), i["distractor_logic"].get(opt,""))
            out.append((i,opt,txt))
    return out

from tag_rules import TOPIC_RULES, STRAND_RULES, GLOBAL_RULES  # noqa: E402

def compile_rules(rs): return [(re.compile(p, re.I|re.S), s) for p,s in rs]
_T={k:compile_rules(v) for k,v in TOPIC_RULES.items()}
_S={k:compile_rules(v) for k,v in STRAND_RULES.items()}
_G=compile_rules(GLOBAL_RULES)

def assign(item, txt):
    for rx,slug in _T.get(item["topic_id"],[]) + _S.get(item["primary_strand"],[]) + _G:
        if rx.search(txt): return slug
    return None

def report(items):
    miss=collections.defaultdict(list); used=collections.Counter(); bad=set()
    for it,opt,txt in rows(items):
        s=assign(it,txt)
        if s is None: miss[it["topic_id"]].append((it["item_id"],opt,txt))
        else:
            used[s]+=1
            if s not in APPROVED: bad.add(s)
    total=len(rows(items)); nm=sum(len(v) for v in miss.values())
    print(f"distractors {total}  tagged {total-nm}  UNMATCHED {nm}  ({(total-nm)/total:.1%})")
    if bad: print("!! SLUGS NOT IN TAXONOMY:", sorted(bad))
    if miss:
        print("\nunmatched by topic:")
        for t,v in sorted(miss.items(), key=lambda kv:-len(kv[1]))[:14]:
            print(f"  {t} ({len(v)})")
            for iid,opt,txt in v[:4]: print(f"      {iid}.{opt} {txt[:135]}")
    return nm, used

def show(items, topic):
    for it,opt,txt in rows(items, topic):
        s=assign(it,txt)
        print(f"{it['item_id']}.{opt}  {s or '*** UNMATCHED ***':46s} {txt[:120]}")

def write(items, topic):
    byfile=collections.defaultdict(list)
    for i in items: byfile[i["_file"]].append(i)
    touched=tags=0
    for f,group in byfile.items():
        if not any(i["topic_id"]==topic for i in group): continue
        raw=json.load(open(f)); changed=False
        for obj in raw:
            if obj["topic_id"]!=topic: continue
            it=next(x for x in group if x["item_id"]==obj["item_id"])
            m={}
            for opt in sorted(obj["answer_choices"]):
                if opt==obj["correct_answer"]: continue
                if (obj["item_id"],opt) in REWRITES:
                    obj["distractor_logic"][opt]=REWRITES[(obj["item_id"],opt)]
                if (obj["item_id"],opt) in CHOICE_FIXES:
                    obj["answer_choices"][opt]=CHOICE_FIXES[(obj["item_id"],opt)]
                s=assign(it, obj["distractor_logic"][opt])
                if s is None: raise SystemExit(f"UNMATCHED {obj['item_id']}.{opt}")
                m[opt]=s
            # Skip any existing misconception_tag: on a re-run its old value
            # would otherwise be copied in after the new one and silently win.
            new={}
            for k,v in obj.items():
                if k=="misconception_tag": continue
                new[k]=v
                if k=="distractor_logic": new["misconception_tag"]=m
            obj.clear(); obj.update(new)
            touched+=1; tags+=len(m); changed=True
        if changed:
            # Match each file's existing on-disk convention exactly: 2-space
            # indent, ASCII-escaped unicode, and whatever trailing-newline state
            # the file already had (the bank is not consistent about it).
            # Anything else rewrites every file and buries the real change.
            trailing_nl = open(f, "rb").read().endswith(b"\n")
            with open(f,"w") as fh:
                json.dump(raw,fh,indent=2,ensure_ascii=True)
                if trailing_nl: fh.write("\n")
    return touched,tags

def audit(topic):
    errs=[]; n=t=0
    for f in sorted(glob.glob("data/items/*/*.json")):
        for obj in json.load(open(f)):
            if obj["topic_id"]!=topic: continue
            n+=1
            mt=obj.get("misconception_tag")
            if mt is None: errs.append(f"{obj['item_id']}: no misconception_tag"); continue
            wrong={o for o in obj["answer_choices"] if o!=obj["correct_answer"]}
            if obj["correct_answer"] in mt: errs.append(f"{obj['item_id']}: correct answer {obj['correct_answer']} carries a tag")
            if set(mt)!=wrong: errs.append(f"{obj['item_id']}: tagged {sorted(mt)} but wrong options are {sorted(wrong)}")
            for o,s in mt.items():
                if s not in APPROVED: errs.append(f"{obj['item_id']}.{o}: slug '{s}' not in taxonomy")
            t+=len(mt)
            if list(obj).index("misconception_tag") != list(obj).index("distractor_logic")+1:
                errs.append(f"{obj['item_id']}: misconception_tag not immediately after distractor_logic")
    return n,t,errs

if __name__=="__main__":
    a=sys.argv[1:]
    items=load()
    if a[0]=="--report": sys.exit(0 if report(items)[0]==0 else 1)
    if a[0]=="--show": show(items,a[1])
    if a[0]=="--write":
        c,t=write(items,a[1]); print(f"{a[1]}: {c} items, {t} tags")
    if a[0]=="--audit":
        n,t,e=audit(a[1])
        print(f"{a[1]}: {n} items, {t} tags, {'OK' if not e else str(len(e))+' ERRORS'}")
        [print("   !",x) for x in e]
        sys.exit(1 if e else 0)
