# The Software 3.0 University and the Future of the Academy

*The accompanying slide deck for this keynote can be accessed [here](https://docs.google.com/presentation/d/12D1M_7rDeuCvoZFHDjGfuF-kNEQJTRjU/edit?usp=sharing&ouid=113914938538100407015&rtpof=true&sd=true).*

## Introduction

Dear organizers, UNNC colleagues, and fellow participants of HEPA Forum 2026. I am very honored to be here and deliver this keynote. This year’s theme, “Continuing the Dialogue,” is very fitting as we are on rapidly shifting ground for university administrators and academics.

Of course, the declaration of a “new era” or a “crisis” is really not new to the audience here. After all, in professions and societies that connect advancement to novelty, we hear it all the time. But it is my belief that, from our collective observations since November 2022 to now, this time is genuinely different. I am, of course, talking about AI. I hope to convince you of this and lay out some possibilities over the next 30 minutes.

Let me offer you a story and a concept first. As a tech enthusiast, I was drawn to AI on Day One. I have been using it non-stop since and even wrote a small paper on its role in education—which is likely obsolete now, read in 2026, as most things from twelve months ago are these days.

Recently, I had lunch in Shanghai with a childhood friend, Stanley. Stanley is the CTO of a mid-sized AI start-up (not “e-commerce”, sorry mate!) and an SJTU-trained computer engineer who has worked across the tech hubs of China, India, and the U.S.. When I asked him how AI has changed his professional life, his answer was blunt: “Completely.”.

In academia, we are mostly still discussing AI in an “input-output” model: a student writes a prompt, and a model responds. But Stanley’s reality is already far beyond that. He now operates in an agentic workflow. From his phone, he manages multiple semi-autonomous “agents” simultaneously. These agents don’t just chat; they read his task descriptions, search local codebases for context, scour the internet for solutions, and implement massive volumes of work. Stanley’s role has fundamentally shifted from writer to architect and auditor. He no longer writes functions; he “prepares the ingredients” by designing context, and manages the bottleneck of verification.

This story leads me to our key concept: **Software 3.0**. Building on Andrej Karpathy’s conceptualization of how programming evolves, we can see a clear trajectory. If Software 1.0 was humans writing explicit lines of *code*, and Software 2.0 was the *weights* neural networks relying on to learn from data to recognize patterns, Software 3.0 represents a paradigm where we program using natural language (*prompts*), coordinating autonomous agents to execute complex, multi-step goals. We are no longer simply compiling code; we are orchestrating cognition.[^1]

Why does this matter to us? Even though not all of us are computer scientists or work in coding, the idea behind the evolution of programming holds profound relevance to us all because Software 3.0 fundamentally changes the definition of professional expertise.

If we look through the lens of classic work from the sociology of professions, we understand that professions do not exist in a vacuum. They exist in an ecosystem, constantly competing for “jurisdiction”—the socially recognized right to control a specific domain of work.[^2] We saw this exact turf war play out recently when tech giants used algorithms and mobile payments to capture the domain of micro-lending, forcing the state to intervene and protect the jurisdiction of traditional banks.

The survival, rise, and fall of any profession hinge on its abstract, professional knowledge. When a profession’s core tasks are easily codified or routinized, its jurisdiction is threatened by adjacent fields or, in this case, by technology. The true power of a profession lies in its *ability to diagnose, infer, and treat problems using abstract knowledge*. However, as AI begins to claim jurisdiction over these cognitive tasks—moving from simple execution to agentic problem-solving—the very foundation of what it means to be an “expert” is destabilized.

My speech today will touch upon three dimensions of this analysis: The Epistemological Pivot, The Crisis of Mastery, and the New Currency of Expertise.

## Three Dimensions

## The Epistemological Pivot

Let me start with the first dimension of our current reality: **The Epistemological Pivot**.

On our campuses, we broadly recognize two major branches of inquiry: the natural and applied sciences, and the human sciences—the arts, humanities, and social sciences. Historically, these branches face distinct problems and deploy entirely different arsenals to solve them. In the age of AI, this divergence has morphed into what can be framed as the **Signal-to-Noise ratio problem**.

Let’s look at the hard sciences, where knowledge is built on a strict, formal chain-of-logic. We are no longer just talking about AI solving textbook equations; we are talking about the absolute frontier of knowledge production.Recently, Fields Medalist Terence Tao led a project that solved 22 million open algebraic problems in just three months.[^3] Similarly, physicist Steve Hsu recently published a paper where an AI autonomously generated a novel theoretical framework in quantum field theory.[^4]

How is AI accelerating so terrifyingly fast here? It is not because the AI is flawless. In fact, Hsu noted that while the AI generated brilliant insights, it also confidently hallucinated highly plausible but entirely false physics concepts.

The secret weapon in these fields isn’t just pure intelligence; it is **formal verification**. In mathematics and physics, the connective tissue between concepts is strict formal logic. Because of this, mathematical reasoning can be translated into machine-readable code—using formal proof assistants like *Lean*. An AI can generate a wild conjecture, and a software verifier can instantly, ruthlessly, and objectively confirm if the logic holds. AI thrives here because the discipline allows us to build an automated referee. The “Signal” can be programmatically separated from the “Noise.” [^5]

Now, let’s cross the campus to the human sciences, where knowledge is built not on formal mathematical proofs, but on **novel, compelling, and empirically supported narratives**.

Take a classic 1989 study examining whether a employee’s control over their tasks increases or decreases their attachment to the firm. This is a question that is vital to many HR departments. Two sociologists, Charles Halaby and David Weakliem do not build a strict logical chain.[^6] Instead, they systematize prevailing commentary into a series of causal hypotheses. The linkages between their steps are theoretical and semantic.

On one hand, they argue for a “Match Quality” link: control allows workers to employ their skills more fully, making them pessimistic about finding a better job, which *increases* attachment. On the other hand, they propose a “Market Opportunity” link: control acts as general training, creating transferable skills that open market opportunities, thereby *negatively* affecting attachment.

When they found an unexpected, significant negative direct effect of worker control on attachment, it did not break a formal logic chain or refute a law of physics. Instead, it required them to generate a new, compelling conjecture about the hidden price of an interesting, high-responsibility job: employees are often held accountable for outcomes entirely outside their control. I suspect that finding resonates deeply with many of the highly competent leaders sitting in this room today.

Why is AI’s progress fundamentally slower here? Because problems such as this broke the “**Verifier’s rule**”. You cannot build an automated verifier for semantic linkages. There is weak correlation between verification and solution; and the reward for verifier is sparse and discontinuous. In this space, a theory wins not because it is mathematically proven, but because it is theoretically novel, accounts for the empirical variance better than the alternatives, and tells a compelling story about human nature: our relationship with the work we do.

AI models are, at their core, engines of massive cognitive compression and structural retrieval. They have brilliantly compressed the unstructured information of the internet, allowing them to synthesize existing academic consensus at lightning speed. They can beautifully mimic our language, but they cannot organically generate novel, compelling sociological meaning. They cannot independently evaluate whether a theoretical argument actually resonates with the messy, subjective reality of the human condition. Here, “ground truth” is interpretive. Competing variables or new psychological concepts reframe the truth rather than strictly refuting it. The referee cannot be automated; it requires human peer review to judge novelty, cultural context, and theoretical resonance.

We are looking at a stark epistemological divide: **Verifiability versus Novelty**. AI is reshaping the “Signal” of the hard sciences through automated, step-by-step verification, while leaving us to grapple with the profound “Noise” of human interpretation. As administrators and educators, we must recognize that Software 3.0 is not hitting our departments equally, and the way we evaluate expertise must pivot accordingly.

## The Crisis of Mastery

If the epistemological pivot shows us *where* AI excels and where it struggles, we must now ask: what happens to the human worker when AI claims jurisdiction over those executable, verifiable tasks? This brings me to our second dimension, and perhaps the greatest contradiction of what AI brings to the labor market: **The Crisis of Mastery**.

We are watching a profound structural friction emerge in the future of jobs. On one hand, Software 3.0 makes an experienced professional even more productive. On the other hand, it actively destroys the training ground required to build that very expertise in the next generation.

Let’s return to my friend Stanley in Shanghai. In our conversation, the most chilling part involved management. Stanley has essentially programmed an agent to supervise his human team. It monitors their to-do lists and cross-references them with the actual work submitted. If a feature is missing, the agent—not Stanley—sends the reminder.

The result? The team productivity has skyrocketed, but his need for entry-level talent has vanished. His message to his team is stark: “If you need an intern but haven’t used your \$200 monthly AI credits, you’ve left juice in the box. Squeeze it.” He anticipates, with caution, that half of his team may soon be redundant—not because they aren’t “good,” but because they haven’t adapted to this hyper-efficient oversight model.

This is the contradiction. Stanley is highly capable of architecting and auditing these AI agents because he spent years in the trenches, manually writing the code, making the mistakes, and building the foundational mental models. But his current, agent-driven workflow leaves very little room for a junior developer to do the same.

As we sat in a Japanese ramen joint, Stanley posed a question that I think we all need to grapple with: *“If we don’t train the chef how to make ramen from scratch, how will he ever know if the robot’s broth tastes good?”*

This “Ramen Chef Problem” is the canary in the coal mine for higher education. We often hear that coding is just text, and because LLMs predict text, programming is uniquely vulnerable. But as our workspaces become increasingly digitized and AI keeps improving, other fields will inevitably follow.

If the routine, execution-level tasks are handled by autonomous agents, we are left with four critical questions regarding how we build mastery:

- **First, Redefining Learning:** If the actual “doing” is automated, what exactly are we teaching?
- **Second, The Reviewer Class:** How do we train students to be “architects” and “reviewers” rather than “executors”?
- **Third, The Skill Gap:** Can a student truly evaluate a complex system if they have never struggled with its foundational, “manual” components?
- **And finally, The Entry-Level Crisis:** What happens to the “internship” or “entry-level” phase of a career when agents can do that work better and faster?

In higher education, our institutional silos often buffer us from the sheer velocity of change sweeping through the professional world. Our students, however, will enjoy no such buffer. The old paradigm is fading. We are transitioning into an era where we must prepare students to oversee a digital workforce, yet our educational infrastructure is still stubbornly designed to teach them how *to be* the workforce. It is tempting to surrender to doomsday thinking when confronting these structural shifts[^7], but I am not one of them. I believe that proactive, smart policy can make all the difference.

The core tension is this: if true mastery of a discipline requires putting in the reps, but the relentless economic incentive is to automate those very reps, then we are staring down a pedagogical crisis every bit as severe as the economic one.

## The New Currency of Expertise

If the Epistemological Pivot explains why AI is succeeding in some areas, and the Crisis of Mastery warns us of the structural damage to our training pipelines, we are left with the ultimate question for higher education. What is the new value proposition? This brings me to the third and final dimension of our current reality: **The New Currency of Expertise**.

Much of human execution is about to be automated. If the cost of generating a formal logic chain or a standard operating procedure is approaching zero, what is the premium skill of the human professional?

To understand this, we have to recognize that not all knowledge is created equal. For decades, universities have excelled at transmitting *codified knowledge*—the explicit facts, formulas, and blueprints that fit neatly into textbooks and exams. Today, AI has consumed that codified knowledge. We also rely on *embodied knowledge*—the expertise baked into physical tools and machinery. While AI might currently lack the robotics to completely rival humans in the physical world, given the sheer velocity of computational advances, closing that gap is simply a matter of time.

But there is a third type of knowledge: the tacit *know-how*. This is the experiential, unspoken wiring of the human brain.[^8] AI can mimic our basic logic, but it cannot organically generate this tacit expertise. It cannot define the goal. The new currency of expertise is the deeply ingrained ability to frame a messy, complex problem, to connect disparate human ideas, and to look at an AI’s output and know, intuitively, whether it actually aligns with the reality of the human condition.

Let’s return to my friend Stanley one last time. He described the experience of operating in this agentic workflow as deeply addictive, comparing it to the “one more turn” syndrome of the strategy game *Civilization*. Because he can move from an abstract idea to a working, tangible prototype in under an hour, the positive feedback loop is intoxicating. This “mania” of instant creation is fundamentally reshaping his day-to-day existence.

But here is the catch: to play this game of *Civilization* effectively, Stanley has had to become an architect and an auditor. The new currency of his expertise is no longer his ability to write the functions himself. It is his ability to design the context, to prepare the ingredients, and to relentlessly verify the output against the messy, complex needs of his business.

For our students, the new currency of expertise will be exactly this: **Architectural Vision and Evaluative Judgment.**

If we look back at the classic theory of professions, we know that professions survive by successfully claiming jurisdiction over abstract, complex tasks. If AI is rapidly claiming jurisdiction over the *execution* of these tasks, human professionals must fiercely claim jurisdiction over the *formulation* of problems. And ultimately, our highest professional value will lie in *orchestration*: leading a human-machine augmented approach to interpret, verify, and navigate the profoundly noisy social outcomes that pure computation alone cannot truly understand.

Our graduates will need to navigate that “noisy” knowledge space we discussed earlier. They will need the sociological imagination to ask the right questions. They will need the epistemological humility to know when an AI’s perfectly logical answer is culturally or ethically disastrous. They will need to be the conductors of an automated orchestra, judging the “taste of the broth” even if they didn’t chop the green onions themselves.

The new expert is not the person who has all the answers. The new expert is the person who can curate iterative prompts, manage a fleet of autonomous agents, and synthesize their outputs into a compelling, novel narrative that moves human society forward.[^9]

## Conclusion

Let me bring these threads together. Software 3.0 means we are no longer just administrators of information pipelines; we are navigating a fundamental shift in what it means to be a professional in the 21st century.

As leaders and policymakers in higher education, our mandate is shifting. It is entirely valid for any of us, personally or professionally, to prefer the quiet reflection of older, unmediated modes of scholarship and living. But as educators, we must recognize that AI has arrived as a foundational, general-purpose technology that will reshape the global landscape. Whatever our individual attitudes toward this shift may be, we cannot rob our students of the opportunity to understand it, nor can we deprive them of the preparedness they will desperately need in a transformed world.

Our task is to engineer utility from these tools. We must build institutions that teach students not just how to prompt an AI, but how to govern it, how to interrogate its outputs, and how to make the resulting knowledge genuinely meaningful for contemporary society. We are now tasked with readying students to oversee a digital workforce, yet our models are still largely designed to teach them how to *be* the workforce. It is imperative that we begin changing these conversations now—not out of a fear of obsolescence, but with the courage to redefine human expertise for the era of Software 3.0.

Thank you.

[^1]: His recent formulation: <https://www.youtube.com/watch?v=LCEmiRjPEtQ> 

[^2]: Abbott, Andrew. (1988). *The System of Professions: An Essay on the Division of Expert Labor*. Chicago: University of Chicago Press. 

[^3]: Tao’s talk: <https://www.youtube.com/watch?v=mS9Lr43cIB4> 

[^4]: Paper: <https://www.sciencedirect.com/science/article/pii/S0370269325008111> ; Companion paper: <https://drive.google.com/file/d/16sxJuwsHoi-fvTFbri9Bu8B9bqA6lr1H/view> ; Online discussion: <https://x.com/hsu_steve/status/1996034522308026435> 

[^5]: This statement is stylistic than substantive. Not all science problems are verifiable and not all human sciences are wicked. For a more formal treatment, see Jason Wei’s [*Asymmetry of verification and verifier’s rule*](https://www.jasonwei.net/blog/asymmetry-of-verification-and-verifiers-law). 

[^6]: Halaby, Charles N., and David L. Weakliem. “Worker Control and Attachment to the Firm.” *American Journal of Sociology* 95, no. 3 (1989): 549–91. <http://www.jstor.org/stable/2780548>. 

[^7]: One recent example is Citrini Research’s [The 2028 Global Intelligence Crisis](https://www.citriniresearch.com/p/2028gic). 

[^8]: The conceptualization is take from Ricardo Housemann. See: <https://growthlab.hks.harvard.edu/publication/economic-development-and-the-accumulation-of-know-how/> 

[^9]: Interestingly many of the leaders of top AI companies believe the same. See: <https://www.wsj.com/lifestyle/careers/what-ai-executives-tell-their-own-kids-about-the-jobs-of-the-future-1ba43f65>
